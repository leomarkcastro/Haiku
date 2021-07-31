const express = require("express")
const mongoose = require("mongoose")
const jwt = require("jsonwebtoken") // JSON Web Token Generator
const bcrypt = require("bcrypt") // Will hash the password
const passport = require("passport")

// Authenticator System
const { authenticate } = require("../functions/server_authentication")

// The MongoDB Models where imported
const Models = require("../models/ModelBundle")
const AccountToken = require("../models/AccountToken")

const account_create = require("../functions/account_create")

// This would handle the flow of files and Form Management as well
const { multerService, request_simpleForm, request_urlencoded } = require("../functions/server_file_formdata")


const router = express.Router()

// TODO : Relocate or Remove this authentication Login sample
router.post('/login', 
    request_simpleForm() , 
    //uwu : multer fixed the JSON only input issue here. Now we can send an actual form data.
    //uwu : I want a unified flow of data into this server so yep, I think too that json is not a bad idea. 
    (req, res, next) => {
        
        passport.authenticate("local", (err, user) => {

            if (err){
                return next(err)
            }
            if (!user){
                return res.send("Wrong Email or Password")
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

// TODO : Relocate or Remove this authentication access sample
router.get("/secret",

    // this part checks for authentication
    authenticate(),
    // this part, as usual, works normal, but now has a user var on request
    (req, res, next) => {
        if (!req.user){
            res.json({username: "Nobody"})
        }
        console.log(req.user)
        res.json(req.user)
    }

)

router.post('/post/create', 
    authenticate(),
    request_simpleForm(),
    async (req, res) => {
        let user = req.user
        let body = req.body

        let newPost = new Models.Post({
            "Content" : body.Content,
            "owner_id": user._id
        })
        let fetchedUser = await Models.User.findById(user._id)

        const sess = await mongoose.startSession()
        await sess.startTransaction()
        await newPost.save({session: sess})
        fetchedUser.posts.push(newPost)
        await fetchedUser.save({session: sess})
        await sess.commitTransaction();
        
        res.send("received")
    }
)

router.post('/post/delete', 
    authenticate(),
    request_simpleForm(),
    async (req, res) => {
        let user = req.user
        let body = req.body

        let toDeletePost = await Models.Post.findById(body.id)
        let fetchedUser = await Models.User.findById(user._id)

        const sess = await mongoose.startSession()
        await sess.startTransaction()
        await toDeletePost.remove({session: sess})
        fetchedUser.posts.pull(toDeletePost)
        await fetchedUser.save({session: sess})
        await sess.commitTransaction();
        
        res.send("received")
    }
)

router.post('/post/update', 
    authenticate(),
    request_simpleForm(),
    async (req, res) => {
        let body = req.body

        let post = await Models.Post.findById(body.id)

        await post.update({
            "Content" : body.Content,
        })
        await post.save()
        
        res.send("received")
    }
)

router.get('/posts', 
    async (req, res) => {
        let params = req.query

        let start = Number(params.start || "0") || 0
        let count = Number(params.count || "10")
        let id = params.user || ""

        let rows = await Models.Post.find(id ? {owner_id : id} : {}).sort({_id: -1})

        res.json(rows.slice(start,start + count))

    }
)

router.get("/test/getuser",  async (req, res) => {

    let query = req.query.name || ""

    let row = await Models.User.findOne({username : query}).populate("posts")
    res.json({
        query : query,
        result: row
    })
})

router.post("/test/testtest", 
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

router.post("/test/createuser", 
    multerService.fields([
        {
            name: "profile_img",
            maxCount: 1
        }
    ]),
    async (req, res) => {
        let data = req.body

        let { new_account, callback_fail } = await account_create(data, req.files.profile_img)

        try{
            await new_account.save()
            const body = new AccountToken(new_account._id, new_account.email, new_account.username)

            const token = jwt.sign(
                {user: body}, 
                process.env.AUTHENTICATION_SECRET,
                {
                    // uwu : Length of token validity is debatable
                    expiresIn : "1d"
                }
            )
            res.json({token})

        }catch(err){
            callback_fail()

            // FIXME : I wish this could be cleaner
            let errList = {}
            for(let field in err.errors){
                errList[field] = err.errors[field].message
            }
            // FIXME : This also is a bit clunky in implementation
            if (err.message.indexOf('duplicate key error') !== -1){
                errList["Duplicate"] = "Email or Username is already taken"
            }
            console.log(err.message)
            res.status(400).send(JSON.stringify(errList))
        }

        
    }
)

module.exports = router