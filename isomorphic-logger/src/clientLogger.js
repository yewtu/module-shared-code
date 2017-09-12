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
        message: messageOrEvent && typeof messageOrEvent === "string" ? messageOrEvent : "Undefined client-side error",
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
        level,
    };
};

const postLogEvent = (logApiUri, logEvent) => {
    axios
        .post(logApiUri, { event: logEvent })
        .catch(error => console.error(error, "Cant send error reports to server!"));
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

export default (loginApiUri) => {
    if (!loginApiUri) throw new Error("No log URI given");
    return {
        listenToUncaughtErrors: (reportUri=loginApiUri) => {

            window.onerror = function ( messageOrEvent, source, lineno, colno, error ) {
                if ( arguments.length === 1 && messageOrEvent ) {
                    const convertedErrorEvent = createErrorEventLike(messageOrEvent);
                    const convertedErrorLogEvent = createErrorLogEvent(convertedErrorEvent);
                    postLogEvent(reportUri, convertedErrorLogEvent);
                }
                else {
                    const errorEventLike = createErrorEventLike(messageOrEvent, source, lineno, colno, error);
                    const errorLogEvent = createErrorLogEvent(errorEventLike);
                    postLogEvent(reportUri, errorLogEvent);
                }
            };
        },

        createLogger: ( reportUri=loginApiUri ) => {

            const logger = {};

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

