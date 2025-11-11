const passport = require("passport");
const { createSecretToken } = require('../util/secretToken');

exports.googleLogin = passport.authenticate("google", {
    scope: ["profile", "email"]
});

exports.googleCallback = [
    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false
    }),
    (req, res) => {
        const user = req.user;
        const token = createSecretToken(user._id, user.role);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, 
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000, 
        });
        res.redirect("http://localhost:5173/home");
    }
];
