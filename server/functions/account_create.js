const fs= require("fs")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")
const Models = require("../models/ModelBundle")
const { gfs } = require('./server_setup')

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
            switch(process.env.FILE_SAVE_METHOD){
                case 'DB':
                    global.gfs.delete( new mongoose.Types.ObjectId(data.profile_img.id), (err,data)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            // TODO : Delete This is Production
                            console.log("image_deleted")
                        }
                    } )
                    break;
                case 'STORAGE':
                    if (data.profile_img){
                        fs.unlinkSync(data.profile_img.path, (err) => {
                            
                            // TODO : Delete This is Production
                            if (err) {
                                console.log("unlink failed", err);
                            } else {
                                console.log("file deleted");
                            }
                        })
                    }
                    break;
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