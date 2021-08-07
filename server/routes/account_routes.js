const express = require("express")
const jwt = require("jsonwebtoken") // JSON Web Token Generator
const passport = require("passport")
const multer = require('multer')

// Authenticator System
const { authenticate } = require("../functions/server_authentication")

// The MongoDB Models where imported
const Models = require("../models/ModelBundle")
const AccountToken = require("../models/AccountToken")

const account_create = require("../functions/account_create")

// This would handle the flow of files and Form Management as well
const { multerService, request_simpleForm } = require("../functions/server_file_formdata")

const router = express.Router()

router.post('/user/login', 
    request_simpleForm() , 
    //uwu : multer fixed the JSON only input issue here. Now we can send an actual form data.
    //uwu : I want a unified flow of data into this server so yep, I think too that json is not a bad idea. 
    (req, res, next) => {
        
        passport.authenticate("local", (err, user) => {

            if (err){
                return next(err)
            }
            if (!user){
                return res.status(400).json({"Error": "Wrong Email or Password"})
            }
            req.login(user, () => {
                const body = new AccountToken(user.id, user.email, user.username)

                const token = jwt.sign(
                    {user: body}, 
                    process.env.AUTHENTICATION_SECRET,
                    {
                        // uwu : Length of token validity is debatable
                        expiresIn : "1d"
                    }
                )
                return res.json({token})
            })
            
        })(req, res, next)
})

router.get("/user/secret",

    // this part checks for authentication
    authenticate(),
    // this part, as usual, works normal, but now has a user var on request
    (req, res, next) => {
        if (!req.user){
            res.json({username: "Nobody"})
        }
        res.json(req.user)
    }

)

router.post("/user/create", 
    async (req, res, next) => {
        
        // CHECK : Does this look good
        multerService.fields([
            {
                name: "profile_img",
                maxCount: 1
            }
        ])(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).json({"Error" : "More than One Profile was Imaged"})
            } else if (err) {
                // An unknown error occurred when uploading.
                next(err)
            }
            
            // Everything went fine.
            let data = req.body

            let { new_account, callback_fail, callback_error } = await account_create(data, req.files.profile_img)

            try{
                await new_account.save()
                const body = new AccountToken(new_account._id, new_account.email, new_account.username)

                const token = jwt.sign(
                    {user: body}, 
                    process.env.AUTHENTICATION_SECRET,
                    {
                        expiresIn : "1d"
                    }
                )
                res.json({token})

            }catch(err){
                callback_fail()

                res.status(400).send(JSON.stringify(callback_error(err)))
            }
        })
        

        
    }
)

router.get("/user",  async (req, res) => {

    let query = req.query.name || ""

    let row = await Models.User.findOne({username : query}).populate("posts").select("username email bio posts")
    res.json({
        query : query,
        result: row
    })
})


module.exports = router