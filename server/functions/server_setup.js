// We import dependencies here
const path = require("path")
const fs = require("fs")
// External Dependencies
const express = require("express") // Main App Server
const mongoose = require("mongoose") // Database Connector
const passport = require("passport") // Authenticator System
const cors = require("cors") // Allows access of our server from different address. Only enforced by Web Browsers tho.

// Root folder location
const rootFolder = path.dirname(require.main.filename)

// We initialize the logger here
const LoggerMain = require("./server_logging")
const logger = LoggerMain.logger
const LoggerError = LoggerMain.model

// We initialize the authentication system
require("./server_authentication")

// This gets the WHITELISTED WEBSITE from env variable and split it by (,)
const whitelist = String(process.env.WHITELISTED_WEBSITES).split(',')

// We initialize the Express App
const app = express()
// We initialize the Authentication System
app.use(passport.initialize())
// This is the folder where you will put your React Folder.
app.use(express.static(path.join(rootFolder, "public")))
// This section allows certain whitelisted websites on access to our website
app.use(cors({
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        }
        (process.env.ALERT_NONWHITELISTED == "true") && console.log(`Someone is accessing the website at IP Address ${origin}`)
        callback(null, false)
        
    }
}))

// CHECK : this might be error prone or not scalable
app.use('/files/image', express.static(`${rootFolder}/Files/profile_image`))

exports.app = app
exports.rootFolder = rootFolder
exports.logger = LoggerMain
exports.connect = function(port=null){
    mongoose.connect(
        `mongodb://${process.env.DB_ADDRESS}/${process.env.DB_COLLECTION}?${process.env.DB_SETTINGS}`, 
        { 
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true,
            retryWrites: false,
        }
    )
    .then( result => {
        console.log(`Connected Database through local port address(es) [${process.env.DB_ADDRESS}]`)
        console.log(`Connected through local port [${port || process.env.PORT}]`)
        app.listen(port || process.env.PORT)
    })
    .catch (err => {
        console.log(err)
    })
}