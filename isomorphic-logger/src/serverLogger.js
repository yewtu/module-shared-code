const chalk = require("chalk");
const hogan = require("hogan.js");
const prepper = require("prepper");
const bodyParser = require("body-parser");

/**
 * The module exports a function that creates the logger and some logging utility functions.
 * @param app {object} - An express app instance.
 * @param details
 * @return {{logger, handleLogRoute: (function(*, *)), logMiddleWare: (function(*, *, *)), listenToGlobalUncaughtErrors: (function())}}
 */
module.exports = (app, {details=false}) => {

    if (!app) throw new Error("serverLogger needs an express app instance.");

    // the effect of the details parameter can be overwritten by an environment variable,
    // this way there is no need for the re-deployment of the application to be able to use detailed logging
    const envKey = "DETAILED_LOGGING";
    const shouldLogDetails = envKey in process.env ? process.env[envKey] === "true" : details;

    const colours = {
        debug: chalk.gray,
        info: chalk.white,
        warn: chalk.yellow,
        error: chalk.red,
        default: chalk.white
    };

    const response = hogan.compile(`{{{messageSource}}} {{{displayTracer}}} {{{displayLevel}}} - {{{timestamp}}} - {{{method}}} {{{url}}} - {{{msg}}} {{package.name}} {{{request.method}}} {{{response.statusCode}}} {{{request.url}}}`);
    const error = hogan.compile(`{{{messageSource}}} {{{displayTracer}}} {{{displayLevel}}} - {{{timestamp}}} - {{{method}}} {{{url}}} \n{{{error.message}}} \n{{{error.stack}}}`);
    const info = hogan.compile(`{{{messageSource}}} {{{displayTracer}}} {{{displayLevel}}} - {{{timestamp}}} - {{{method}}} {{{url}}} - {{{msg}}} {{package.name}} {{{message}}} {{{${shouldLogDetails?"details":""}}}}`);

    const onMessage = (event) => {
        const timestamp = (new Date(event.timestamp || Date.now()) ).toLocaleString();
        const data = Object.assign({}, event, {
            messageSource: event.messageSource && typeof event.messageSource === "string" ? event.messageSource.toUpperCase() : "SERVER",
            displayTracer: "tracer" in event ? event.tracer.substr(0, 6) : '------',
            displayLevel: event.level.toUpperCase(),
            timestamp,
            details: Object.keys(event).length ? `\n ${JSON.stringify(event, null, 2)}` : '',
            method: event.method || '',
            url: event.url || '',
            msg: event.msg || '',
        });
        const colour = colours[event.level] || colours.default;
        const log = console[event.level] || console.info; // eslint-disable-line no-console
        if ("response" in event && 'statusCode' in event.response) log(colour(response.render(data)));
        else if ('error' in event && 'message' in event.error) log(colour(error.render(data)));
        else log(colour(info.render(data)));
    };

    const createLogMiddleWare = (logger) => (req, res, next) => {
        const {url,method,headers,params,body={}} = req;
        logger.log({url, method, headers, params, body});
        next();
    };

    const handlers = prepper.handlers;
    const pkg = "loggingTest";

    const logger = new prepper.Logger({ handlers: [
        new handlers.Merge({ package: pkg }),
        // TODO: what else should be in the detailed logging?
        // new handlers.Merge({ service: { env: process.env.SERVICE_ENV } }),
        // new handlers.Process(),
        new handlers.System(),
        new handlers.Timestamp(),
    ]}).on('message', event => {
        onMessage(event);
    });

    return {
        logger,
        listenToHttp: () => {
            app.use(bodyParser.json());
            app.use(createLogMiddleWare(logger));

        },
        handleLogRoute: ( req, res ) => {
            if (!req.body) throw new Error("serverLogger requires body property generated by body-parser");
            const { event } = req.body;
            if(!event) {
                res.status(400).send();
                return;
            }
            onMessage(event);
            res.status(200).send();
        },
        listenToGlobalUncaughtErrors: () => {
            process.on('uncaughtException', ( err ) => {
                logger.error(err);
                process.exit();
            });
        }
    };
};
