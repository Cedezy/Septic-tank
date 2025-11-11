const About = require('../models/AboutUs');

exports.getAboutUs = async (req, res) => {
    try {
        const about = await About.find();
        res.status(200).json({ success: true, about });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Failed to get About Us' });
    }
};

exports.updateAboutUs = async (req, res) => {
    try {
        const existing = await About.findOne();
        if (!existing) {
            return res.status(404).json({ success: false, message: 'About Us document not found' });
        }

        const updated = await About.findByIdAndUpdate(existing._id, req.body, { new: true });
        res.status(200).json({ success: true, message: 'About Us updated successfully.', about: updated });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Failed to update About Us', error: err.message });
    }
};
