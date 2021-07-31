require('dotenv').config()

const multer = require("multer")
const path = require("path")

// TODO Set this up for appropriate use later

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        if (file.fieldname == "profile_img"){
            cb(null, "Files/profile_image")
        }
        //else if (file.fieldname == "test_pdf"){
        //    cb(null, "Files/pdf")
        //}
        else{
            cb(null, "Files/others")
        }
    },
    filename : (req, file, cb) => {
        cb(null, `FILE-${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {fileSize: '30mb'},
})

module.exports = upload