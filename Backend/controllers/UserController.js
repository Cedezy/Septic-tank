const User = require('../models/User');
const Booking = require('../models/Booking');
const calculateAge = require('../util/calculateAge');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    try {
        const { fullname, email, password, phone, role, province, city, barangay, street, birthdate } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Auto-calculate age if birthdate is provided
        let age = null;
        if (birthdate) {
            age = calculateAge(birthdate);
        }

        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
            phone,
            role,
            province,
            city,
            barangay,
            street,
            birthdate,
            age,
            isActive: true,
            isVerified: true
        });
         const userType = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';

        res.status(201).json({ success: true,  message: `${userType} created successfully.`, user: newUser });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ success: false, message: 'Failed to create user.', error: err.message });
    }
};


exports.getUserById = async (req, res) => {
    try{
        const user = await User.findById(req.params.userId).select('-password');
        if(!user){
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        res.json({ success: true, message: 'User found.', user });
    } 
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to fetch user.', error: err.message });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find(
            { role: { $in: ['customer', 'manager', 'technician'] } },
            '-password'
        );

        res.json({
            success: true,
            message: 'Users fetched successfully.',
            users
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to get users.',
            error: err.message
        });
    }
};

exports.getUserByRole = async (req, res) => {
    try {
        const role = req.params.role;

        // Find all customerIds that have completed a booking
        const completedCustomerIds = await Booking.distinct("customerId", { status: "completed" });

        // Get users with the role but exclude those in completedCustomerIds
        const users = await User.find({
            role,
            _id: { $nin: completedCustomerIds } // exclude completed users
        })
        .select('-password')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            message: "Users fetched successfully (excluding completed customers).",
            users
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to get users by role.",
            error: err.message
        });
    }
};



exports.updateUser = async (req, res) => {
  try {
    const { fullname, email, phone, role, province, city, barangay, street, birthdate, password } = req.body;

    let updates = { fullname, email, phone, role, province, city, barangay, street };

    // Recalculate age if birthdate is updated
    if (birthdate) {
      updates.birthdate = birthdate;
      updates.age = calculateAge(birthdate);
    }

    // Hash password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updates.password = hashedPassword;
    }

    // Update user
    const updated = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).select('-password');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Get role for message
    const updatedRole = updated.role
      ? updated.role.charAt(0).toUpperCase() + updated.role.slice(1)
      : 'User';

    res.json({
      success: true,
      message: `${updatedRole} updated successfully.`,
      user: updated
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user.',
      error: err.message
    });
  }
};

exports.updateAccountSettings = async (req, res) => {
    try {
        const { 
            fullname, 
            email, 
            currentPassword, 
            newPassword,
            phone,
            birthdate,
            province,
            city,
            barangay,
            street
        } = req.body;

        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Handle password change
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        // Update other profile fields
        user.fullname = fullname || user.fullname;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.birthdate = birthdate || user.birthdate;
        user.province = province || user.province;
        user.city = city || user.city;
        user.barangay = barangay || user.barangay;
        user.street = street || user.street;

        await user.save();

        const sanitized = user.toObject();
        delete sanitized.password;

        res.json({ 
            success: true, 
            message: 'Account settings updated successfully.', 
            user: sanitized 
        });
    } 
    catch (err) {
        res.status(500).json({ success: false, message: 'Update failed.', error: err.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    try{
        const user = await User.findById(req.user._id).select("-password");

        if(!user){
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } 
    catch(err){
        res.status(500).json({ success: false, message: "Failed to fetch user.", error: err.message });
    }
};

exports.deactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if(!user){
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.isActive = false;
        await user.save();

        res.json({ 
            success: true, 
            message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} deactivated successfully.`, 
            user 
        });
    } 
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to deactivate user.', error: err.message });
    }
};

exports.reactivateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');

        if(!user){
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        user.isActive = true;
        await user.save();

        res.json({ 
            success: true, 
            message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} reactivated successfully.`, 
            user 
        });
    } 
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to reactivate user.', error: err.message });
    }
};

