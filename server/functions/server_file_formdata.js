const multer = require("multer")
const path = require("path")
const fs = require("fs")
const express = require("express")

// Root folder location
const rootFolder = path.dirname(require.main.filename)

// TODO : Set this up for appropriate use later

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        if (file.fieldname == "profile_img"){
            const path = `${rootFolder}/Files/profile_image`
            fs.mkdirSync(path, { recursive: true })
            return cb(null, path)
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


exports.multerService = upload
exports.request_simpleForm = () => (upload.fields([]))
exports.request_urlencoded = () => express.urlencoded({extended:false})
exports.request_json = () => express.json()