const mongoose = require("mongoose")

const Post = mongoose.Schema({
    "Content" : {
        type: String,
        required: [true, "Post should contain something"],
        maxLength: [100, "Is this even a haiku?"]
    },
    "owner_id": {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
})

module.exports = mongoose.model("Post", Post, "haiku_posts")