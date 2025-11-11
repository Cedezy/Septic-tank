const Contact = require('../models/ContactUs');

exports.getContactUs = async (req, res) => {
    try{
        const contact = await Contact.find();
        res.status(200).json({ success: true, contact });
    }
    catch(err){
        res.status(400).json({ success: false, message: 'Failed to get Contact us'});
    }
}

exports.updateContactUs = async (req, res) => {
    try {
        const contact = await Contact.findOneAndUpdate({}, req.body, { new: true });

        if(!contact){
            return res.status(404).json({ success: false, message: 'Contact not found.' });
        }

        res.status(200).json({ success: true, message: 'Contact info updated successfully.', contact });
    } 
    catch(err){
        res.status(400).json({ success: false, message: 'Failed to update Contact info.', error: err.message });
    }
};
