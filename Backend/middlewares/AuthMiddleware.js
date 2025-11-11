const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");

exports.userVerification = async (req, res, next) => {
    const token = req.cookies.token;
    if(!token){
        return res.status(401).json({ status: false, message: "Unauthorized: No token provided" });
    }
    try{
        const decoded = jwt.verify(token, process.env.TOKEN_KEY); 
        const user = await User.findById(decoded.id);

        if(!user){
            return res.status(404).json({ status: false, message: "User not found" });
        }
        req.user = user;
        next();
    } 
    catch(err){
        return res.status(401).json({ status: false, message: "Invalid or expired token" });
    }
};


