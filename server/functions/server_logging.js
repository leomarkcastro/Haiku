require('dotenv').config()

// We load Winston - our logging engine
const winston = require('winston')

// We load our Logging Model
const LoggerError = require('../models/LoggerError')

// We also load our custom Discord Outlet
const discord_logger = require('./server_discordlog')

// ... and our downloaded winston daily rotate file. This would create
//  a new file every day.
require('winston-daily-rotate-file');
const path = require("path")

// We initiate the main winston logger
const logger = winston.createLogger({
    level: process.env.FILE_LOG_LEVEL,
    format: winston.format.json(),
    defaultMeta: { service: process.env.SERVER_NAME },
})

const rootFolder = path.dirname(require.main.filename)

// We set up the daily rotate file transport
var dailyrotate = new winston.transports.DailyRotateFile({
    filename: path.join(rootFolder, process.env.FILE_LOG_LOCATION, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
});

// We add the transports to our logger here.
// TODO Add transport selections here based on type of environment

//   First added is a console output
logger.add(new winston.transports.Console({
    format: winston.format.json() // winston.format.simple()
}))

//   Then the daily rotate transport
logger.add(dailyrotate)

//    Then finally the discord transport
logger.add(new discord_logger)

//    Here we can also log the unhandled errors in the app.
if (process.env.LOG_UNHANDLED == "true") {
    process.on('uncaughtException', function (err) {
        if (err) {
            
            // WARNING This section is heavily sensitive. This is the section that is suppose to provide the error. If you made an error in this section, you can't detect it.
            // FIXME This could be an issue later in production. Have to optimize this section better.

            logger.error(new LoggerError("Unhandled Error Exception. Server Shutted Down", err.stack))

            //process.exit(1);
        }
    });
}


// We export logger and the model
exports.logger = logger
exports.model = LoggerError