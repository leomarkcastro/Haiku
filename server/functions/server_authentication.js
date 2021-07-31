require('dotenv').config()


const passport = require("passport") // Authenticator System
const LocalStrategy = require("passport-local") // Plugin for Passport. For Account Creation
const passport_jwt = require("passport-jwt") // Plugin for JWT + Passport. For JWToken Checking

JWTStrategy = passport_jwt.Strategy

// TODO Remove this sample data
const user = {
    id : "1",
    email: "test@test.com",
    password: "pass"
}

passport.use( new LocalStrategy({
    usernameField: "email", 
    }, 
    (email, password, done) => {

        // TODO Reimplement this with MongoDB
        if((email == user.email) && (password == user.password)){
            return done(null, user)
        }
        return done(null, false)
    }
))

passport.use( 
    new JWTStrategy({
        jwtFromRequest: passport_jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.AUTHENTICATION_SECRET
    },
    (jwt_payload, done) => {
        
        // TODO Reimplement this with MongoDB

        if(user.id === jwt_payload.user._id){
            // uwu what the fuck is happening here.
            // uwu for implementation, maybe just check if account in database
            // uwu we could literally return anything at this funnel.
            return done(null, jwt_payload.user)
        }
        return done(null, false, {
            message: "Token Not Matched"
        })

    }
))
  