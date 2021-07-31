require('dotenv').config()

// We import dependencies here
const path = require("path")
const fs = require("fs")
// External Dependencies
const express = require("express") // Main App Server
const mongoose = require("mongoose") // Database Connector
const jwt = require("jsonwebtoken") // JSON Web Token Generator
const passport = require("passport") // Authenticator System
const bcrypt = require("bcrypt") // Will hash the password
const cors = require("cors") // Allows access of our server from different address. Only enforced by Web Browsers tho.

const Models = require("./models/ModelBundle")

// We initialize the logger here
const LoggerMain = require("./functions/server_logging")
const logger = LoggerMain.logger
const LoggerError = LoggerMain.model

// We initialize the authentication system
require("./functions/server_authentication")

// This would handle the flow of files and Form Management as well
const multerService = require("./functions/server_file_formdata")

// This gets the WHITELISTED WEBSITE from env variable and split it by (,)
const whitelist = String(process.env.WHITELISTED_WEBSITES).split(',')

// We initialize the Express App
const app = express()
// We initialize the Authentication System
app.use(passport.initialize())
// This is the folder where you will put your React Folder.
app.use(express.static(path.join(__dirname, "public")))
// This section allows certain whitelisted websites on access to our website
app.use(cors({
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        }
        console.log(`Someone is accessing the website at IP Address ${origin}`)
        callback(null, false)
        
    }
}))

// Use urlencoded:false to receive x-www-encoded. I think
// app.use(express.urlencoded({extended: false}))

// Use urlencoded:true to receive form-data. I think
// app.use(express.urlencoded({extended: true}))

// Use json() to process json data
// app.use(express.json())

// CHECK this might be error prone or not scalable
app.use('/files/image', express.static('Files/profile_image'))

// TODO Relocate or Remove this authentication Login sample
app.post(
    '/login', 
    multerService.fields([]) , 
    //uwu multer fixed the JSON only input issue here. Now we can send an actual form data.
    // uwu I want a unified flow of data into this server so yep, I think too that json is not a bad idea. 
    (req, res, next) => {

        console.log(req.body)
        
        passport.authenticate("local", (err, user) => {

            if (err){
                return next(err)
            }
            if (!user){
                return res.send("Wrong Email or Password")
            }
            req.login(user, () => {
                const body = {_id: user.id, email: user.email}

                const token = jwt.sign({user: body}, process.env.AUTHENTICATION_SECRET)
                return res.json({token})
            })
            
        })(req, res, next)
})

// TODO Relocate or Remove this authentication access sample
app.get("/secret",

    // this part checks for authentication
    passport.authenticate("jwt", {session : false}),
    // this part, as usual, works normal, but now has a user var on request
    (req, res, next) => {
        if (!req.user){
            res.json({username: "Nobody"})
        }
        console.log(req.user)
        res.json(req.user)
    }

)

app.get("/test/getuser",  async (req, res) => {

    let query = req.query.name || ""

    let rows = await Models.User.find({username : query})
    res.json({
        query : query,
        result: rows
    })
})

app.post(
    "/test/testtest", 
    multerService.fields([
        {
            name : 'test_image'
        },
        {
            name: 'test_pdf'
        }
    ]),
    (req, res) => {

        let data = req

        console.log(data)
        res.send("Received")

    }
)

app.post(
    '/upload', 
    multerService.fields([]) , 
    async (req, res) => {
        
        console.log(req.files)
        console.log(req.body)

        res.send(`<p>Received!</p>`)
    }
)

app.post(
    "/test/createuser", 
    multerService.fields([
        {
            name: "profile_img",
            maxCount: 1
        }
    ]),
    async (req, res) => {
        let data = req.body

        // TODO Maybe implement the create account as a function itself
        let account_template = {
            "email" : "",
            "password_hash": "",
            "bio": "",
            "profile_img": null,
            "posts": []
        }

        // Hash password
        // TODO Implement password hash as a function
        let salt = await bcrypt.genSalt(10);
        let password_hash = await bcrypt.hash(data.password, salt) 
        data.password_hash = password_hash

        // TODO Implement profile image success as a function
        // If a profile image is supplied, add it to data
        if (req.files.profile_img){
            data.profile_img = req.files.profile_img[0]
            // CHECK This is no really scalable and could mess up the entire system if we rearrange all files. Or maybe not
            data.profile_img.source = `files/image/${data.profile_img.filename}`
        }
        
        // Populate the Models User
        let new_account = new Models.User({
            ...account_template,
            ...data,
        })
        
        console.log(new_account)
        try{
            await new_account.save()
            res.send("Received")
        }catch(err){
            // TODO Implement as part password hash function
            if (data.profile_img){
                fs.unlinkSync(data.profile_img.path, (err) => {
                    if (err) {
                        console.log("unlink failed", err);
                    } else {
                        console.log("file deleted");
                    }
                })
            }

            // FIXME I wish this could be cleaner
            let errList = {}
            for(let field in err.errors){
                errList[field] = err.errors[field].message
            }
            // FIXME This also is a bit clunky in implementation
            if (err.message.indexOf('duplicate key error') !== -1){
                errList["Duplicate"] = "Email or Username is already taken"
            }
            console.log(err.message)
            res.status(400).send(JSON.stringify(errList))
        }

        
    }
)

// TODO Remove this later
app.use("*", (req, res) => {
    res.send("Express Server Now Working!")
})


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
    console.log(`Connected through local port [${process.env.PORT}]`)
    app.listen(process.env.PORT)
})
.catch (err => {
    console.log(err)
})
