const Faq = require('../models/FAQs');

exports.createFaq = async (req, res) => {
    try{
        const faq = new Faq(req.body);
        await faq.save();
        res.status(201).json({ success: true, message: 'FAQs added successfully.', faq });
    } 
    catch(err){
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getFaqs = async (req, res) => {
    try{
        const faqs = await Faq.find().sort({ order: 1 });
        res.json({ success: true, faqs });
    }
    catch(err){
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateFaq = async (req, res) => {
    try{
        const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, message: 'FAQs updated successfully.', faq });
    }
    catch(err){
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.deleteFaq = async (req, res) => {
    try{
        await Faq.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'FAQ deleted successfully.' });
    }
    catch(err){
        res.status(400).json({ success: false, message: err.message });
    }
};
