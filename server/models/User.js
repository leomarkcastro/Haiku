const mongoose = require("mongoose")

const User = mongoose.Schema({
    "email" : {
        type: String,
        required: [true, "Email is Required"],
        unique: true,
        maxLength: [50, "Email is Too Long. Why the hell?"]
    },
    "password_hash": {
        type: String,
        required: [true, "Password is Required"],
    },
    "username": {
        type: String,
        maxLength: [25, "Username is advised to be lower than 25 letters."],
        required: [true, "Username is Required"],
        unique: true,
    },
    "bio": {
        type: String,
        maxLength: [250, "Your account bio is too long for your own good."],
    },
    "profile_img": {}, // this would receive a meta-data
    "posts": [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true,
        }
    ]
})

module.exports = mongoose.model("User", User, "haiku_accounts")