const axios = require("axios");
const prepper = require("prepper");
const {Merge, System, Timestamp} = prepper.handlers;

const messageHandler = postApiUri => (event) => {
    const data = Object.assign({}, event, {
        displayTracer: "tracer" in event ? event.tracer.substr(0, 6) : '------',
        displayLevel: event.level.toUpperCase(),
        timestamp: event.timestamp.toLocaleString(),
        details: Object.keys(event).length ? `\n ${JSON.stringify(event, null, 2)}` : ''
    });
    const log = console[event.level] || console.info; // eslint-disable-line no-console
    log(data);
    axios.post(postApiUri)
        .catch(error => console.error(error)); //If failed to post error to the logger service endpoint, display and error
};

module.exports= (logApiUri) => {

    const logger = new prepper.Logger({ handlers: [
        new Merge({ package: "client" }),
        // new handlers.Merge({ someAddedInfo: "Plus info"}),
        // new handlers.Merge({ service: { env: process.env.SERVICE_ENV } }),
        // new handlers.Process(),
        new System(),
        new Timestamp(),
    ]}).on('message', event => {
        messageHandler(logApiUri)(event);
    });

    window.onerror = function ( messageOrEvent, source, lineno, colno, error ) {
        if (arguments.length = 1 && messageOrEvent) {
            logger.error(messageOrEvent);
            if ( messageOrEvent instanceof String ) {
                logger.error(new Error(messageOrEvent));
            }
            else logger.error(messageOrEvent);
        }
        else {
            const errorDescriptor = {
                url: document.location.href,
                message: messageOrEvent,
                source, lineno, colno, error
            };
            logger.error(Object.assign(errorDescriptor, { error: new Error(messageOrEvent) }));
        }
    };

    return logger;
};
