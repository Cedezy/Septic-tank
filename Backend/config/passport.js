const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
    try{
        const existingUser = await User.findOne({ email: profile.emails[0].value });

        if(existingUser){
            return done(null, existingUser);
        }

        const newUser = await User.create({
            fullname: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true,
            isOAuth: true,
            password: null, 
            role: 'user'
        });

        return done(null, newUser);
        } 
        catch(err){
            return done(err, null);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});
