const multer = require("multer")
const path = require("path")
const fs = require("fs")
const express = require("express")
const crypto = require('crypto')
const {connection} = require('./server_database')
const {GridFsStorage} = require('multer-gridfs-storage')

// Root folder location
const rootFolder = path.dirname(require.main.filename)

// TODO : Set this up for appropriate use later
const storage = {
    STORAGE : multer.diskStorage({
        destination : (req, file, cb) => {
            if (file.fieldname == "profile_img"){
                const path = `${rootFolder}/${process.env.FILE_SAVE_LOCATION_STORAGE}`
                fs.mkdirSync(path, { recursive: true })
                return cb(null, path)
            }
            //else if (file.fieldname == "test_pdf"){
            //    cb(null, "Files/pdf")
            //}
            else{
                cb(null, `${rootFolder}/${process.env.FILE_SAVE_LOCATION_STORAGE}`)
            }
        },
        filename : (req, file, cb) => {
            cb(null, `FILE-${Date.now()}${path.extname(file.originalname)}`)
        }
    }),
    DB :  new GridFsStorage({
        db: connection,
        file: (req, file) => {
            return new Promise((resolve, reject) => {
                crypto.randomBytes(16, (err, buf) => {
                    if (err){
                        return reject(err)
                    }
                    const filename = buf.toString('hex') + path.extname(file.originalname);
                    const fileInfo = {
                        filename,
                        bucketName: process.env.FILE_SAVE_LOCATION_DB.replace(" ","__")
                    };
                    resolve(fileInfo)
                })
            })
        }
    })
}

const upload = multer({
    storage: storage[process.env.FILE_SAVE_METHOD],
    limits: {fileSize: '50mb'},
})

exports.multerService = upload
exports.request_fileForm = (req, res, fileData, callBack) => upload.fields(fileData)(req, res, async(err) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        return res.status(400).json({"Error" : "More than One File was Uploaded"})
    } else if (err) {
        // An unknown error occurred when uploading.
        next(err)
    }

    callBack()
})
exports.request_simpleForm = () => (upload.fields([]))
exports.request_urlencoded = () => express.urlencoded({extended:false})
exports.request_json = () => express.json()