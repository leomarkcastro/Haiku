const express = require("express")
const mongoose = require("mongoose")
const multer = require("multer")

// Authenticator System
const { authenticate } = require("../functions/server_authentication")

// The MongoDB Models where imported
const Models = require("../models/ModelBundle")

// This would handle the flow of files and Form Management as well
const { multerService ,request_fileForm, request_simpleForm } = require("../functions/server_file_formdata")
const db_errorparser = require("../functions/db_errorparser")
const db_idcheck = require("../functions/db_idcheck")
const res_clienterror = require("../functions/res_clienterror")

const router = express.Router()


router.post('/upload/cbTest', 
    async (req, res, next) => {
        
        request_fileForm(req, res, 
            [{
                name: "file_test",
                maxCount: 3
            }],
            () => {
                res.send(req.files)
            }
        )
    }
)

router.post('/upload/test', 
    async (req, res, next) => {
        
        multerService.fields([
            {
                name: "file_test",
                maxCount: 1
            }
        ])(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading.
                return res.status(400).json({"Error" : "More than One File was Uploaded"})
            } else if (err) {
                // An unknown error occurred when uploading.
                next(err)
            }

            res.send(req.files)

        })
    }
)

module.exports = router