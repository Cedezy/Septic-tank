const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { createSecretToken } = require('../util/secretToken');
const { sendOtp } = require('../util/sendEmail');
const jwt = require("jsonwebtoken");
const calculateAge = require('../util/calculateAge');

exports.signup = async (req, res) => {
    try {
        const { fullname, email, password, city, barangay, street, phone, birthdate, gender } = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser && existingUser.isVerified){
            return res.status(400).json({ success: false, message: 'Email is already registered and verified.' });
        }

        const phoneRegex = /^(09|\+639)\d{9}$/;
        if(!phoneRegex.test(phone)){
            return res.status(400).json({ success: false, message: 'Invalid mobile number format.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        const age = calculateAge(birthdate); 
        if(age < 18){
            return res.status(400).json({ success: false, message: "You must be at least 18 years old!" });
        }

        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
            role: 'customer',
            phone,
            city,
            barangay,
            street,
            birthdate,
            age,
            gender,
            otp,
            otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
            isVerified: false
        });

        await sendOtp(email, otp, 'signup');

        res.status(201).json({
            message: 'Signup successful! OTP sent to your email.',
            success: true,
            user: { email: newUser.email, age: newUser.age, gender: newUser.gender, isVerified: newUser.isVerified }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Signup failed.' });
    }
};


exports.verifyOtp = async (req, res) => {
    const { email, signupOtp } = req.body;

    try{
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).json({ message: "User not found", success: false });
        }

        if(user.otp !== signupOtp || user.otpExpiry < Date.now()){
            return res.status(400).json({ message: "Invalid or expired OTP", success: false });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        res.status(200).json({ message: "OTP verified. You can now log in.", success: true });
    }
    catch(err){
        return res.status(500).json({ message: "Error verifying OTP", success: false });
    }
   
};

exports.login = async (req, res) => {
    try{
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({ success: false, message: 'Email not found.' });
        }

        if(!user.isVerified){
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
        }

        if(!user.isActive){
            return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }

        const token = createSecretToken(user._id, user.role);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,        // HTTPS only
            sameSite: 'none',    // Required if frontend & backend are different domains
            maxAge: 24 * 60 * 60 * 1000,
        });


        res.status(200).json({
            message: 'Logged in successfully!',
            success: true,
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                role: user.role
            }
        });
    }
    catch(err){
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
};

exports.resendOtp = async (req, res) => {
    try{
        const { email } = req.body;

        const user = await User.findOne({ email });
        if(!user || user.isVerified){
             return res.status(400).json({ success: false, message: 'Invalid request.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOtp(email, otp);

        res.status(200).json({ message: 'OTP resent successfully to your email.', success: true });
    } 
    catch(err){
        res.status(500).json({ message: 'Failed to resend OTP.', success: false });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully!", success: true });
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });

        if(!user){
            return res.status(200).json({ message: "OTP sent if email exists", success: true });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        
        user.resetOtp = otp;
        user.resetOtpExpiry = otpExpiry;
        await user.save();
        await sendOtp(email, otp, 'reset');

        res.status(200).json({ message: "OTP sent successfully to your email.", success: true });
    }
    catch(err){
        res.status(500).json({ message: "Error sending OTP", success: false });
    }
}

exports.resetPassword = async (req, res) => {
    const { email, resetOtp, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if(!user){
            return res.status(404).json({ message: "User not found", success: false });
        }

        if(user.resetOtp !== resetOtp || user.resetOtpExpiry < Date.now()){
            return res.status(400).json({ message: "Invalid OTP", success: false });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10); 
        user.password = hashedPassword;
        user.resetOtp = null;
        user.resetOtpExpiry = null;
        await user.save();

        res.status(200).json({ 
            message: "Password reset successfully", 
            success: true,
            role: user.role
        });
    } 
    catch(err){
        res.status(500).json({ message: "Error resetting password", success: false });
    }
};

exports.checkLoginUser = async (req, res) => {
    try {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({ success: false, message: "Not logged in" });
        }

        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const user = await User.findById(decoded.id).select("-password");

        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            message: "User is logged in",
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive
            }
        });
    } 
    catch(err){
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};



