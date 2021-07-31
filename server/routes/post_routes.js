const express = require("express")
const mongoose = require("mongoose")

// Authenticator System
const { authenticate } = require("../functions/server_authentication")

// The MongoDB Models where imported
const Models = require("../models/ModelBundle")

// This would handle the flow of files and Form Management as well
const { request_simpleForm } = require("../functions/server_file_formdata")
const db_errorparser = require("../functions/db_errorparser")
const db_idcheck = require("../functions/db_idcheck")
const res_clienterror = require("../functions/res_clienterror")


const router = express.Router()


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

        try{
            const sess = await mongoose.startSession()
            await sess.startTransaction()
            await newPost.save({session: sess})
            fetchedUser.posts.push(newPost)
            await fetchedUser.save({session: sess})
            await sess.commitTransaction();

            res.json({"Success" : newPost._id})
        }
        catch(err){
            res_clienterror(res, db_errorparser(err))
        }
        
        
    }
)

router.post('/post/delete', 
    authenticate(),
    request_simpleForm(),
    async (req, res) => {
        let user = req.user
        let body = req.body

        if (!db_idcheck(body.id)){
            return res_clienterror(res, "Post does not exist")
        }

        let toDeletePost = await Models.Post.findById(body.id)
        let fetchedUser = await Models.User.findById(user._id)
        
        if (!toDeletePost){
            return res_clienterror(res, "Post does not exist")
        }
        
        const sess = await mongoose.startSession()
        await sess.startTransaction()
        await toDeletePost.remove({session: sess})
        if (fetchedUser){
            fetchedUser.posts.pull(toDeletePost)
            await fetchedUser.save({session: sess})
        }
        await sess.commitTransaction();
        
        if (!fetchedUser){
            return res_clienterror(res, "Post does not exist")
        }
        res.json({"Success" : "The post was successfully deleted"})
    }
)

router.post('/post/update', 
    authenticate(),
    request_simpleForm(),
    async (req, res) => {
        let body = req.body
        let user = req.user

        if (!db_idcheck(body.id)){
            return res_clienterror(res, "Post does not exist")
        }

        let post = await Models.Post.findById(body.id)

        if (!post){
            return res_clienterror(res, "Post does not exist")
        }

        if (user._id != post.owner_id){
            return res_clienterror(res, "You do not own the post")
        }

        await post.update({
            "Content" : body.Content,
        })
        await post.save()
        
        res.json({"Success" : "Post updated Successfully"})
    }
)

router.get('/posts', 
    async (req, res) => {
        let params = req.query

        let start = Number(params.start || "0") || 0
        let count = Number(params.count || "10")
        let id = params.user || ""

        if (id.length > 0 && !db_idcheck(id)){
            res_clienterror(res, "Owner does not Exist")
        }

        let rows = await Models.Post.find(id ? {owner_id : id} : {}).sort({_id: -1})

        res.json(rows.slice(start,start + count))

    }
)

router.get('/post', 
    async (req, res) => {
        let params = req.query

        let id = params.id || ""

        if (!db_idcheck(id)){
            res_clienterror(res, "Post does not Exist")
        }

        let row = await Models.Post.findOne({_id : id})

        if (!row){
            return res_clienterror(res, "Post does not Exist")
        }

        res.json(row)

    }
)


module.exports = router