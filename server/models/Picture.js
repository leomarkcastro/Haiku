const mongoose = require("mongoose")

const Picture = mongoose.Schema({
    "meta_data": {}
})

module.exports = mongoose.model("Picture", Picture, "haiku_pictures")