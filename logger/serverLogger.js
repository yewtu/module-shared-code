const chalk = require("chalk");
const hogan = require("hogan.js");
const prepper = require("prepper");

module.exports = () => {

    const colours = {
        debug: chalk.gray,
        info: chalk.white,
        warn: chalk.yellow,
        error: chalk.red,
        default: chalk.white
    };

    const response = hogan.compile(`{{{messageSource}}} - {{{timestamp}}} - {{{displayTracer}}} {{{displayLevel}}} {{package.name}} {{{request.method}}} {{{response.statusCode}}} {{{request.url}}}`);
    const error = hogan.compile(`{{{messageSource}}} - {{{timestamp}}} - {{{displayTracer}}} {{{displayLevel}}} {{package.name}} {{{message}}} {{{code}}}\n{{{error.stack}}}`);
    const info = hogan.compile(`{{{messageSource}}} - {{{timestamp}}} - {{{displayTracer}}} {{{displayLevel}}} {{package.name}} {{{message}}} {{{details}}}`);

    const onMessage = (event) => {
        const timestamp = (new Date(event.timestamp || Date.now) ).toLocaleString();
        const data = Object.assign({}, event, {
            messageSource: event.messageSource || "server",
            displayTracer: "tracer" in event ? event.tracer.substr(0, 6) : '------',
            displayLevel: event.level.toUpperCase(),
            timestamp,
            details: Object.keys(event).length ? `\n ${JSON.stringify(event, null, 2)}` : ''
        });
        const colour = colours[event.level] || colours.default;
        const log = console[event.level] || console.info; // eslint-disable-line no-console
        if ("response" in event && 'statusCode' in event.response) log(colour(response.render(data)));
        else if ('error' in event && 'message' in event.error) log(colour(error.render(data)));
        else log(colour(info.render(data)));
    };

    const handlers = prepper.handlers;
    const pkg = "loggingTest";

    const logger = new prepper.Logger({ handlers: [
        new handlers.Merge({ package: pkg }),
        // new handlers.Merge({ someAddedInfo: "Plus info"}),
        // new handlers.Merge({ service: { env: process.env.SERVICE_ENV } }),
        // new handlers.Process(),
        new handlers.System(),
        new handlers.Timestamp(),
    ]}).on('message', event => {
        onMessage(event);
    });

    return {
        logger,
        handleLogReques: ( req, res ) => {

        },
        listenToGlobalUncaughtErrors: () => {
            process.on('uncaughtException', function ( err ) {
                console.log(err.stack);
                process.exit();
            });
        }
    };
};