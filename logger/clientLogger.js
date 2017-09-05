import axios from "axios";

/**
 * This function creates and error event like object or if it's supplied with a proper error event, it then it returns an error event.
 * @param {string} messageOrEvent
 * @param {string} filename
 * @param {number} lineno
 * @param {number} colno - column number (# of the letter where the error occurred)
 * @param {Error} error
 * @return {*}
 */
const createErrorEventLike = (messageOrEvent, filename, lineno, colno, error) => {
    if (error && error.stack && error.message) {
        return {stack: error.stack, message: error.message};
    }
    if (messageOrEvent && messageOrEvent.stack && messageOrEvent.message) return messageOrEvent;
    return {
        message: messageOrEvent && messageOrEvent instanceof String ? messageOrEvent : "Undefined client-side error",
        stack: filename && lineno && colno ?`at ${filename}:${lineno}:${colno}` : "No stack trace available for this error"
    };
};

const createErrorLogEvent = (errorEventLike)=> {
    return {
        messageSource: "client",
        timestamp: Date.now(),
        userAgentString: navigator.userAgent,
        url: window.location.href,
        error: errorEventLike,
        level: "error"
    };
};

const createLogEvent = (level, msg)=> {
    let parsedMsg;
    try {
        parsedMsg = msg instanceof String ? msg : JSON.stringify(msg);
    } catch (e) {
        parsedMsg = "Unable to parse log msg";
    }
    return {
        messageSource: "client",
        msg: parsedMsg,
        timestamp: Date.now(),
        userAgentString: navigator.userAgent,
        url: window.location.href,
        level,
    };
};

const postLogEvent = (logApiUri, logEvent) => {
    axios
        .post(logApiUri, logEvent)
        .catch(error => console.error(error, "Cant send error reports to server!"));
};

const createLogger = (logApiUri) => {

    const logger = {};

    window.onerror = function ( messageOrEvent, source, lineno, colno, error ) {
        if (arguments.length === 1 && messageOrEvent) {
            const convertedErrorEvent = createErrorEventLike(messageOrEvent);
            const convertedErrorLogEvent = createErrorLogEvent(convertedErrorEvent);
            postLogEvent(logApiUri, convertedErrorLogEvent);
        }
        else {
            const errorEventLike = createErrorEventLike(messageOrEvent, source, lineno, colno, error);
            const errorLogEvent = createErrorLogEvent(errorEventLike);
            postLogEvent(logApiUri, errorLogEvent);
        }
    };

    logger.log = wrapConsole('log', logApiUri);
    logger.info = wrapConsole('info', logApiUri);
    logger.warn = wrapConsole('warn', logApiUri);
    logger.debug = wrapConsole('debug', logApiUri);
    logger.trace = wrapConsole('trace', logApiUri);
    logger.error = wrapConsole('error', logApiUri);

    return logger;
};

const wrapConsole = ( level, logApiUrl ) => ( ...args ) => {
    const levels = [ "warn", "info", "debug", "trace", "log" ];
    if (!args) return;
    const arg = args.length === 1 ? args[0] : null;
    switch ( true ) {
        case level === "error": {
            console.error( arg || "" );
            const errorEventLike = createErrorEventLike(arg || "");
            const errorLogEvent = createErrorLogEvent(errorEventLike);
            postLogEvent(logApiUrl, errorLogEvent);
            break;
        }
        case levels.includes(level): {
            console[level](arg || args);
            const logEvent = createLogEvent(level, arg || args);
            postLogEvent(logApiUrl, logEvent);
            break;
        }
        default: {
            const logEvent = createLogEvent(level, arg || args);
            console.log(arg || args);
            postLogEvent(logApiUrl, logEvent);
            break;
        }
    }
};

export default createLogger;
