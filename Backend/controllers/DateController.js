const BlockedDate = require('../models/BlockedDate');

exports.getBlockedDates = async (req, res) => {
    try{
        const dates = await BlockedDate.find().sort({ date: 1 });
        res.json(dates);
    } 
    catch(err){
        res.status(500).json({ message: 'Failed to fetch blocked dates', success: false });
    }
};

exports.addBlockedDate = async (req, res) => {
    const { date, reason } = req.body;

    try{
        const existing = await BlockedDate.findOne({ date });
        if (existing) return res.status(400).json({ message: 'Date already blocked' });

        const newDate = new BlockedDate({ date, reason });
        await newDate.save();
        res.status(201).json({newDate, message: 'Block date added succesfully', success: true });
    }
    catch(err){
        res.status(500).json({ message: 'Failed to block date', success: false });
    }
};

exports.deleteBlockedDate = async (req, res) => {
    const { id } = req.params;

    try{
        const removed = await BlockedDate.findByIdAndDelete(id);
        if(!removed) return res.status(404).json({ error: 'Date not found' });

        res.json({ message: 'Blocked date removed successfully', success: true });
    }
    catch(err){
        res.status(500).json({ message: 'Failed to delete blocked date', sucess: false });
    }
};
