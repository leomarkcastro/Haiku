const passport = require("passport") // Authenticator System
const LocalStrategy = require("passport-local") // Plugin for Passport. For Account Creation
const passport_jwt = require("passport-jwt") // Plugin for JWT + Passport. For JWToken Checking
const bcrypt = require("bcrypt")

const Models = require("../models/ModelBundle")
const { logger, model : ErrorModel } = require("./server_logging")

JWTStrategy = passport_jwt.Strategy

passport.use( new LocalStrategy({
    usernameField: "email", 
    }, 
    async (email, password, done) => {

        let query = email || ""

        let user = await Models.User.findOne({email : query})

        if(!user) {return done(null ,false)}

        let passcheck = await bcrypt.compare(password, user.password_hash)

        if((email == user.email) && (passcheck)){
            return done(null, user)
        }
        return done(null, false)
    }
))

passport.use( 
    new JWTStrategy(
    {
        jwtFromRequest: passport_jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.AUTHENTICATION_SECRET
    },
    async (jwt_payload, done) => {

        let query = jwt_payload.user._id || ""

        let user = await Models.User.findOne({_id : query})

        if(!user) {
            logger.warn(new ErrorModel("Authentication Token Error", `Someone managed to create a token in our server without actually existing in our database. Source of Error: ${JSON.stringify(jwt_payload.user)}`))
            return done(null, false, {
                message: "Token is Invalid"
            })
        }

        if(user._id == jwt_payload.user._id){
            return done(null, jwt_payload.user)
        }
        return done(null, false, {
            message: "Token Not Matched"
        })

    }
))

exports.authenticate = () => (passport.authenticate('jwt', {session:false}))