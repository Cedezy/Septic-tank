const ContactMessage = require('../models/Message');

exports.sendContactMessage = async (req, res) => {
    try{
        const { name, email, message } = req.body;

        if(!name || !email || !message){
        return res.status(400).json({ success: false, message: 'All fields are required.' });
        }

        const newMessage = await ContactMessage.create({ name, email, message });

        res.status(201).json({ success: true, message: 'Message sent successfully.', data: newMessage });
    } 
    catch (err) {
        res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
};


exports.getAllMessages = async (req, res) => {
    try{
        const messages = await ContactMessage.find().sort({ createdAt: -1 });

        res.status(200).json({ success: true, messages });
    } 
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to retrieve messages.' });
    }
};


exports.markAsRead = async (req, res) => {
    try{
        const { id } = req.params;

        const updated = await ContactMessage.findByIdAndUpdate(id, { status: 'Read' }, { new: true });

        if (!updated) {
        return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        res.status(200).json({ success: true, message: 'Message marked as read.', data: updated });
    } 
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to update message status.' });
    }
};

exports.markAsUnread = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await ContactMessage.findByIdAndUpdate(
            id,
            { status: 'Unread' },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: 'Message not found.' });
        }

        res.status(200).json({
            success: true,
            message: 'Message marked as unread.',
            data: updated
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update message status.' });
    }
};


exports.deleteMessage = async (req, res) => {
    try{
        const { id } = req.params;

        const deleted = await ContactMessage.findByIdAndDelete(id);
        if(!deleted){
            return res.status(404).json({ success: false, message: 'Message not found!' });
        }
        res.status(200).json({ success: true, message: 'Message deleted successfully.' });
    }
    catch(err){
        res.status(500).json({ success: false, message: 'Failed to delete message.' })
    }
}