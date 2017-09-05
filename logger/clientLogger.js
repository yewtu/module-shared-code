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
    if (error && error.stack && error.message) return error;
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

const postLogEvent = (logApiUri, logEvent) => {
    axios
        .post(logApiUri, logEvent)
        .catch(error => console.error(error, "Cant send error reports to server!"));
};

const createLogger = (logApiUri) => {

    const logger = console;

    window.onerror = function ( messageOrEvent, source, lineno, colno, error ) {
        if (arguments.length === 1 && messageOrEvent) {
            const errorEventLike = createErrorEventLike(messageOrEvent);
            const errorLogEvent = createErrorLogEvent(errorEventLike);
            postLogEvent(errorLogEvent);
        }
        else {
            const errorEventLike = createErrorEventLike(messageOrEvent, source, lineno, colno, error);
            const errorLogEvent = createErrorLogEvent(errorEventLike);
            postLogEvent(errorLogEvent);
        }
    };

    return logger;
};

export default createLogger;
