require("dotenv").config()
// Server here has been setup with the following implementation
// Authentication, Database, File Flow, CORS, Logger
const { app, connect } = require("./functions/server_setup")
const { logger , model : LoggerModel } = require("./functions/server_logging")

// We import the routes here
const post_routes = require("./routes/post_routes")
const account_routes = require("./routes/account_routes")

//app.use(testRoutes)
app.use('/api', account_routes)
app.use('/api', post_routes)

// TODO : Change this later
app.use("*", (req, res) => {
    res.send("Express Server Now Working!")
})

connect()