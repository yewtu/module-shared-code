## Isomorphic logging

### clientLogger
In contrary to the serverLogger, the clientLogger is written in ES6 so it needs transpilation.

Usage:
```
import ClientLogger from "module-shared-code/isomorphic-logger/client";
const clientLogger = ClientLogger("/log"); //post the log info to /log

clientLogger.listenToUncaughtErrors();
// listen for global errors (it ignores errors trown from the console!)

const logger = clientLogger.createLogger();
//create a logger

logger.info("Front end app has started!"); 
// logs the message as info priority on the server and on the browser
```

#### listenToUncaughtErrors
This function handles uncaught errors and sends their stack-trace to the given log handler REST route.

#### createLogger
Creates a logger that has the previously log route bound, or if given it a new route as argument.

##### logging methods ()
The logger wraps every logging method that `console` has (eg.: `logger.info()`). Invoking `error, debug, trace, log, warn, info` will have two results:
1) the browser console logs the given data with the corresponding method.
2) the **logged data** and **log level** info (in case of the error the stack trace) the current **url** where the browser's navigated into and some details are sent to the server.

Detailed information is only displayed on the back-end when the serverLogger is created with {details:true}.

### serverLogger
This module doesn't need transpilation on `node 8.1`. 

#### Usage
The creation of the logger requires an express app instance.
```
const ServerLogger = require("module-shared-code/isomorphic-logger/server");
const serverLogger = ServerLogger(app, { details: false }); //where app is an express app

const {logger} = serverLogger;
// the logger doesn't need to be created in the server side because 
// it can only log to stdout and std error (based on the log level)

serverLogger.listenToHttp()
// listen for HTTP packets

serverLogger.listenToGlobalUncaughtErrors()

app.post('/log', serverLogger.handleLogRoute); 
// listen for clientRouter
```