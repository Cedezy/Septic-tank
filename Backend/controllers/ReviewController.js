const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.id;

    try{
        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({ message: 'Booking not found' });
        }

        if(booking.status !== 'completed'){
            return res.status(400).json({ message: 'You can only review completed bookings' });
        }

        const existingReview = await Review.findOne({ bookingId });
        if(existingReview){
            return res.status(400).json({ message: 'You already submitted a review for this booking' });
        }

        const review = new Review({
            customerId,
            bookingId,
            technicianId: booking.technicianId,
            rating,
            comment
        });

        await review.save();

        res.status(201).json({ message: 'Review submitted successfully' });
    } 
    catch(err){
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getReviewsByTechnician = async (req, res) => {
    try{
        const reviews = await Review.find({ technicianId: req.params.techId }).populate('customerId', 'fullname');
        res.status(200).json(reviews);
    } 
    catch(err){
        res.status(500).json({ message: 'Failed to get reviews' });
    }
};

exports.getReviewsByCustomer = async (req, res) => {
    try{
        const customerId = req.user.id;
        const reviews = await Review.find({ customerId });

        if(!reviews){
            return res.status(404).json({ message: 'No reviews found' });
        }
        res.status(200).json({ reviews });
    } 
    catch(err){
        res.status(500).json({ message: 'Failed to fetch customer reviews' });
    }
};

exports.getAllReviews = async (req, res) => {
    try{
        const reviews = await Review.find().populate('customerId', 'fullname').populate('bookingId');
        if(!reviews){
            return res.status(404).json({ message: 'No reviews found' });
        }
        res.status(200).json({ reviews });
    }
    catch(err){
        res.status(500).json({ message: 'Failed to fetch reviews', success: false });
    }
}

exports.updateReviewStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "approved" | "rejected"

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const review = await Review.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!review) return res.status(404).json({ message: 'Review not found' });

        res.status(200).json({ message: `Review ${status} successfully!`, review });
    } 
    catch (err) {
        res.status(500).json({ message: 'Failed to update review status' });
    }
};

