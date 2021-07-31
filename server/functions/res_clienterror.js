module.exports = (res, content) => (res.status(400).json({
    "Error" : content
}))