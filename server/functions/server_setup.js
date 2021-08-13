// We import dependencies here
const path = require("path")
const fs = require("fs")
// External Dependencies
const express = require("express") // Main App Server
const mongoose = require("mongoose") // Database Connector
const passport = require("passport") // Authenticator System
const cors = require("cors") // Allows access of our server from different address. Only enforced by Web Browsers tho.
const rateLimit = require("express-rate-limit") // Rate limits the API request of IP

// Root folder location
const rootFolder = path.dirname(require.main.filename)

// We initialize the database connection
const database = require("./server_database")

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

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

// We limit the request to 100 per 15 minutes
const limiter = rateLimit({
    windowMs: Number(process.env.RATE_MINUTES) * 60 * 1000, // 15 minutes
    max: Number(process.env.RATE_REQUESTS), // limit each IP to 100 requests per windowMs
    message : process.env.RATE_MESSAGE
});

//  apply to all requests
app.use(limiter);

let gfs;

// CHECK : this might be error prone or not scalable
switch (process.env.FILE_SAVE_METHOD){
    case 'DB':
        app.get('/file/:filename', (req, res) => {
            if (gfs){
                gfs.find({filename : req.params.filename }).toArray((err, files) => {
                    if (!files[0] || files.length === 0){
                        return res.status(200).json({
                            success: false,
                            message: 'No files available'
                        })
                    }

                    if(files[0].contentType === "image/jpeg" ||
                        files[0].contentType === "image/png" ||
                        files[0].contentType === "image/svg+xml" ||
                        true
                    ){
                        gfs.openDownloadStreamByName(req.params.filename).pipe(res)
                    } else{
                        res.status(404).json({
                            err: "Not an Image"
                        })
                    }
                })
            } else{
                console.log("gfs not initiated yet")
            }
        })
        break;
    case 'STORAGE':
        app.use('/file', express.static(`${rootFolder}/${process.env.FILE_SAVE_LOCATION_STORAGE}`))
        break;
}
app.use('/file', (req,res)=>{res.send("File Not Found")})


exports.app = app
exports.rootFolder = rootFolder
exports.logger = LoggerMain
exports.connect = async (port=null) => {
    if (await database.connection){
        console.log(` ✓ Connected through local port [${port || process.env.PORT}]`)

        if (process.env.FILE_SAVE_METHOD === 'DB'){
            const conn = mongoose.connection;
            gfs = new mongoose.mongo.GridFSBucket(conn.db, {
                bucketName: process.env.FILE_SAVE_LOCATION_DB.replace(" ","__")
            })
            // FIXME: Avoid using global variables. This is shitty.
            global.gfs = gfs
            console.log(` ✓ Connected GridFS through local port [${port || process.env.DB_ADDRESS}]`)
        }
        
        app.listen(port || process.env.PORT)
    }
}
