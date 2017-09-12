"use strict";

var chalk = require("chalk");
var hogan = require("hogan.js");
var prepper = require("prepper");
var bodyParser = require("body-parser");

/**
 * The module exports a function that creates the logger and some logging utility functions.
 * @param app {object} - An express app instance.
 * @param details
 * @return {{logger, handleLogRoute: (function(*, *)), logMiddleWare: (function(*, *, *)), listenToGlobalUncaughtErrors: (function())}}
 */
module.exports = function (app, _ref) {
    var _ref$details = _ref.details,
        details = _ref$details === undefined ? false : _ref$details;


    if (!app) throw new Error("serverLogger needs an express app instance.");

    // the effect of the details parameter can be overwritten by an environment variable,
    // this way there is no need for the re-deployment of the application to be able to use detailed logging
    var envKey = "DETAILED_LOGGING";
    var shouldLogDetails = envKey in process.env ? process.env[envKey] === "true" : details;

    var colours = {
        debug: chalk.gray,
        info: chalk.white,
        warn: chalk.yellow,
        error: chalk.red,
        default: chalk.white
    };

    var response = hogan.compile("{{{messageSource}}} {{{displayTracer}}} {{{displayLevel}}} - {{{timestamp}}} - {{{method}}} {{{url}}} - {{{msg}}} {{package.name}} {{{request.method}}} {{{response.statusCode}}} {{{request.url}}}");
    var error = hogan.compile("{{{messageSource}}} {{{displayTracer}}} {{{displayLevel}}} - {{{timestamp}}} - {{{method}}} {{{url}}} - {{{msg}}} {{package.name}} {{{message}}} {{{code}}}\n{{{error.stack}}}");
    var info = hogan.compile("{{{messageSource}}} {{{displayTracer}}} {{{displayLevel}}} - {{{timestamp}}} - {{{method}}} {{{url}}} - {{{msg}}} {{package.name}} {{{message}}} {{{" + (shouldLogDetails ? "details" : "") + "}}}");

    var onMessage = function onMessage(event) {
        var timestamp = new Date(event.timestamp || Date.now()).toLocaleString();
        var data = Object.assign({}, event, {
            messageSource: event.messageSource && typeof event.messageSource === "string" ? event.messageSource.toUpperCase() : "SERVER",
            displayTracer: "tracer" in event ? event.tracer.substr(0, 6) : '------',
            displayLevel: event.level.toUpperCase(),
            timestamp: timestamp,
            details: Object.keys(event).length ? "\n " + JSON.stringify(event, null, 2) : '',
            method: event.method || '',
            url: event.url || '',
            msg: event.msg || ''
        });
        var colour = colours[event.level] || colours.default;
        var log = console[event.level] || console.info; // eslint-disable-line no-console
        if ("response" in event && 'statusCode' in event.response) log(colour(response.render(data)));else if ('error' in event && 'message' in event.error) log(colour(error.render(data)));else log(colour(info.render(data)));
    };

    var createLogMiddleWare = function createLogMiddleWare(logger) {
        return function (req, res, next) {
            var url = req.url,
                method = req.method,
                headers = req.headers,
                params = req.params,
                _req$body = req.body,
                body = _req$body === undefined ? {} : _req$body;

            logger.log({ url: url, method: method, headers: headers, params: params, body: body });
            next();
        };
    };

    var handlers = prepper.handlers;
    var pkg = "loggingTest";

    var logger = new prepper.Logger({ handlers: [new handlers.Merge({ package: pkg }),
        // TODO: what else should be in the detailed logging?
        // new handlers.Merge({ service: { env: process.env.SERVICE_ENV } }),
        // new handlers.Process(),
        new handlers.System(), new handlers.Timestamp()] }).on('message', function (event) {
        onMessage(event);
    });

    return {
        logger: logger,
        listenToHttp: function listenToHttp() {
            app.use(bodyParser.json());
            app.use(createLogMiddleWare(logger));
        },
        handleLogRoute: function handleLogRoute(req, res) {
            if (!req.body) throw new Error("serverLogger requires body property generated by body-parser");
            var event = req.body.event;

            if (!event) {
                res.status(400).send();
                return;
            }
            onMessage(event);
            res.status(200).send();
        },
        listenToGlobalUncaughtErrors: function listenToGlobalUncaughtErrors() {
            process.on('uncaughtException', function (err) {
                logger.error(err);
                process.exit();
            });
        }
    };
};
