require('dotenv').config()

// We import the Discord Node Loggger
const DiscordLogger = require('node-discord-logger');
const os = require('os')
// We will integrate the node discord logger into a Winston Transport outlet
const Transport = require('winston-transport');

// We first initialize the Discord Communication
const logger = new DiscordLogger.default({
    hook: process.env.DISCORD_LOG_HOOK,
    serviceName: process.env.SERVER_NAME, // optional, will be included as text in the footer
    defaultMeta: {                    // optional, will be added to all the messages
        'Process ID': process.pid,
        Host: os.hostname(),            // import os from 'os';
    },
    errorHandler: err => {            // optional, if you don't want this library to log to console
        console.error('error from discord', err);
    }
});

// I have to map the error levels of Winston and Node Discord
const levels = { 
    //log : "log",
    debug : "info",
    info : "info",
    warn : "error",
    error : "error",
}

// We export the Winston-Compatible Discord Transport Outlet 
module.exports = class DiscordTransport extends Transport {
    constructor(opts) {
        super(opts);
        //
        // Consume any custom options here. e.g.:
        // - Connection information for databases
        // - Authentication information for APIs (e.g. loggly, papertrail, 
        //   logentries, etc.).
        //
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        logger[levels[levels[info.level]]]({
            message : `${info.level.toUpperCase()} : ${info.title}`,
            description: info.message,
            error: info.details ? info.details : undefined,
            // json
        })
        //debug, info, info, log

        callback();
    }
};