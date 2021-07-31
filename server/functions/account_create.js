const fs= require("fs")
const bcrypt = require("bcrypt")
const Models = require("../models/ModelBundle")

module.exports = async (data, profile_image) => {
    let account_template = {
        "email" : "",
        "password_hash": "",
        "bio": "",
        "profile_img": null,
        "posts": []
    }

    // Hash password
    let password_hash = await bcrypt.hash(data.password, 12) 
    data.password_hash = password_hash

    // If a profile image is supplied, add it to data
    if (profile_image){
        data.profile_img = profile_image[0]
        // CHECK : This is no really scalable and could mess up the entire system if we rearrange all files. Or maybe not
        data.profile_img.source = `files/image/${data.profile_img.filename}`
    }
    
    // Populate the Models User
    let new_account = new Models.User({
        ...account_template,
        ...data,
    })

    return {
        new_account,
        callback_fail : () => {
            if (data.profile_img){
                fs.unlinkSync(data.profile_img.path, (err) => {
                    if (err) {
                        console.log("unlink failed", err);
                    } else {
                        console.log("file deleted");
                    }
                })
            }
        },
        callback_error : (err) => {
            let errList = {}
            for(let field in err.errors){
                errList[field] = err.errors[field].message
            }
            
            // uwu : This also is a bit clunky in implementation
            if (err.message.indexOf('duplicate key error') !== -1){
                errList["Duplicate"] = "Email or Username is already taken"
            }
            
            return errList
        }

    }
}