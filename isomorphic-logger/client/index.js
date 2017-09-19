"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function creates and error event like object or if it's supplied with a proper error event, it then it returns an error event.
 * @param {string} messageOrEvent
 * @param {string} filename
 * @param {number} lineno
 * @param {number} colno - column number (# of the letter where the error occurred)
 * @param {Error} error
 * @return {*}
 */
var createErrorEventLike = function createErrorEventLike(messageOrEvent, filename, lineno, colno, error) {
    if (error && error.stack && error.message) {
        return { stack: error.stack, message: error.message };
    }
    if (messageOrEvent && messageOrEvent.stack && messageOrEvent.message) return { // if valid Error object
        message: messageOrEvent.message,
        stack: messageOrEvent.stack
    }; // this object must be created with the two keys explicitly set, instead of returning the error object itself
    // Error objects cannot be sent with AJAX requests (and can't be JSON.stringified)
    return {
        message: messageOrEvent && typeof messageOrEvent === "string" ? messageOrEvent : "Undefined client-side error",
        stack: filename && lineno && colno ? "at " + filename + ":" + lineno + ":" + colno : "No stack trace available for this error"
    };
};

var createErrorLogEvent = function createErrorLogEvent(errorEventLike) {
    return {
        messageSource: "client",
        timestamp: Date.now(),
        userAgentString: navigator.userAgent,
        url: window.location.href,
        error: errorEventLike,
        level: "error"
    };
};

var createLogEvent = function createLogEvent(level, msg) {
    var parsedMsg = void 0;
    try {
        parsedMsg = typeof msg === "string" ? msg : JSON.stringify(msg);
    } catch (e) {
        parsedMsg = "Unable to parse log msg";
    }
    return {
        messageSource: "client",
        msg: parsedMsg,
        timestamp: Date.now(),
        userAgentString: navigator.userAgent,
        url: window.location.href,
        level: level
    };
};

var postLogEvent = function postLogEvent(logApiUri, logEvent) {
    _axios2.default.post(logApiUri, { event: logEvent }).catch(function (error) {
        return console.error(error, "Cant send error reports to server!");
    });
};

var wrapConsole = function wrapConsole(level, logApiUrl) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var levels = ["warn", "info", "debug", "trace", "log"];
        if (!args) return;
        var arg = args.length === 1 ? args[0] : null;
        switch (true) {
            case level === "error":
                {
                    console.error(arg || "");
                    var errorEventLike = createErrorEventLike(arg || "");
                    var errorLogEvent = createErrorLogEvent(errorEventLike);
                    postLogEvent(logApiUrl, errorLogEvent);
                    break;
                }
            case levels.includes(level):
                {
                    console[level](arg || args);
                    var logEvent = createLogEvent(level, arg || args);
                    postLogEvent(logApiUrl, logEvent);
                    break;
                }
            default:
                {
                    var _logEvent = createLogEvent(level, arg || args);
                    console.log(arg || args);
                    postLogEvent(logApiUrl, _logEvent);
                    break;
                }
        }
    };
};

exports.default = function (loginApiUri) {
    if (!loginApiUri) throw new Error("No log URI given");
    return {
        listenToUncaughtErrors: function listenToUncaughtErrors() {
            var reportUri = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : loginApiUri;


            window.onerror = function (messageOrEvent, source, lineno, colno, error) {
                if (arguments.length === 1 && messageOrEvent) {
                    var convertedErrorEvent = createErrorEventLike(messageOrEvent);
                    var convertedErrorLogEvent = createErrorLogEvent(convertedErrorEvent);
                    postLogEvent(reportUri, convertedErrorLogEvent);
                } else {
                    var errorEventLike = createErrorEventLike(messageOrEvent, source, lineno, colno, error);
                    var errorLogEvent = createErrorLogEvent(errorEventLike);
                    postLogEvent(reportUri, errorLogEvent);
                }
            };
        },

        createLogger: function createLogger() {
            var reportUri = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : loginApiUri;


            var logger = {};

            logger.log = wrapConsole('log', reportUri);
            logger.info = wrapConsole('info', reportUri);
            logger.warn = wrapConsole('warn', reportUri);
            logger.debug = wrapConsole('debug', reportUri);
            logger.trace = wrapConsole('trace', reportUri);
            logger.error = wrapConsole('error', reportUri);

            return logger;
        }
    };
};
