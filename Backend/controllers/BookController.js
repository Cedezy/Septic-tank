const Booking = require('../models/Booking');
const TechnicianStatus = require('../models/TechnicianStatus')
const ServiceType = require('../models/ServiceType')
const User = require('../models/User');

exports.createBooking = async (req, res) => {
    try {
        const { date, time, serviceType, paymentMethod, notes } = req.body;
        const customerId = req.user._id;

         if(!date || !time){
            return res.status(400).json({ 
                success: false, 
                message: 'Date and time are required!' 
            });
        }

        const service = await ServiceType.findById(serviceType);
        if(!service){
            console.log('Service not found for ID:', serviceType);
            return res.status(404).json({ success: false, message: 'Service not found.' });
        }

        let price = service.price;
        let duration = service.duration;

        const booking = await Booking.create({
            customerId,
            date,
            time,
            serviceType,
            price,
            duration, 
            paymentMethod,
            notes: notes || ""
        });

        console.log('Booking created:', booking);

        res.status(200).json({ success: true, message: "Schedule submitted successfully!", booking });
    } 
    catch(err){
        console.error('Error in createBooking:', err);
        res.status(500).json({ message: 'Failed to create booking.', success: false });
    }
};


exports.getBookingsByCustomer = async (req, res) => {
    try {
        const customerId = req.user._id;
        let bookings = await Booking.find({ customerId })
            .populate('technicianId')
            .populate('serviceType')
            .populate('customerId');

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found for this customer.', success: false });
        }

        // Custom sort: pending first, then confirmed, completed, cancelled, declined
        const statusOrder = ['pending', 'confirmed', 'completed', 'cancelled', 'declined'];
        bookings.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

        res.status(200).json({ message: 'Customer bookings fetched successfully.', success: true, bookings });
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch customer bookings.', success: false });
    }
};


exports.getAllBookings = async (req, res) => {
    try{
        const bookings = await Booking.find()
            .populate('customerId')
            .populate('technicianId')
            .populate('serviceType');

        const order = { 
            pending: 1, 
            confirmed: 2, 
            completed: 3, 
            cancelled: 4 
        };

        const sortedBookings = bookings.sort((a, b) => {
            const statusOrder = (order[a.status] || 99) - (order[b.status] || 99);

            if(statusOrder !== 0) return statusOrder;

            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        res.status(200).json({
            message: 'All bookings fetched successfully.',
            success: true,
            bookings: sortedBookings,
        });
    } 
    catch(err){
        res.status(500).json({
            message: 'Failed to fetch all bookings.',
            success: false,
        });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, reason } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if(status === 'cancelled'){
            booking.status = 'cancelled';
            booking.cancelReason = reason
                ? `Cancelled by admin: ${reason}`
                : 'Cancelled by Admin';
        } 
        else{
            booking.status = status;
        }

        await booking.save();

        res.json({
            success: true,
            message: 'Booking status updated successfully.',
            booking,
        });
    } 
    catch(err){
        res.status(500).json({ success: false,  message: 'Failed to update booking status.' });
    }
};

exports.assignTechnician = async (req, res) => {
    try {
        const { technicianId } = req.body;
        const bookingId = req.params.bookingId;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found', success: false });
        }

        // Check if technician exists and is active
        const technician = await User.findOne({ _id: technicianId, role: 'technician', isActive: true });
        if (!technician) {
            return res.status(400).json({
                success: false,
                message: 'Technician not found or is deactivated.'
            });
        }

        // Check technician status
        const techStatus = await TechnicianStatus.findOne({ technicianId });
        if (techStatus && techStatus.status === 'unavailable') {
            return res.status(400).json({
                success: false,
                message: `Technician ${technician.fullname} is currently unavailable.`
            });
        }

        // Assign technician
        booking.technicianId = technicianId;
        booking.status = 'pending'; // optional: reset to pending when assigned
        await booking.save();

        // Update technician status to unavailable
        if (techStatus) {
            techStatus.status = 'unavailable';
            await techStatus.save();
        } else {
            // create status if doesn't exist
            await TechnicianStatus.create({ technicianId, status: 'unavailable' });
        }

        await booking.populate('technicianId', 'fullname');

        res.status(200).json({
            message: `${booking.technicianId.fullname} assigned successfully.`,
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to assign technician', success: false });
    }
};

exports.getAssignedTechnician = async (req, res) => {
    try {
        const technicianId = req.user._id;

        const bookings = await Booking.find({ technicianId })
            .populate('customerId')
            .populate('serviceType')
             .populate('technicianId');

        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No assigned bookings yet.'
            });
        }

        // Status sorting order
        const order = { 
            pending: 1, 
            confirmed: 2, 
            completed: 3, 
            cancelled: 4,
            declined: 5
        };

        const sortedBookings = bookings.sort((a, b) => {
            const statusOrder = (order[a.status] || 99) - (order[b.status] || 99);

            if (statusOrder !== 0) return statusOrder;

            // Sort by date if status is the same
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB;
        });

        res.status(200).json({
            success: true,
            message: 'Assigned bookings retrieved successfully.',
            bookings: sortedBookings
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch assigned bookings.'
        });
    }
};

exports.respondToBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { action, reason } = req.body; // action = 'accept' or 'decline'
        const technicianId = req.user._id;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (!booking.technicianId || booking.technicianId.toString() !== technicianId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Not assigned to you.' });
        }

        if (action === 'accept') {
            booking.status = 'confirmed';
        } 
        else if (action === 'decline') {
            booking.status = 'declined';
            booking.cancelReason = reason ? `Declined by technician: ${reason}` : 'Declined by technician';
        } 
        else {
            return res.status(400).json({ success: false, message: 'Invalid action. Use "accept" or "decline".' });
        }

        await booking.save();

        // Update technician availability
        const techStatus = await TechnicianStatus.findOne({ technicianId });
        if (techStatus) {
            techStatus.status = (action === 'accept') ? 'unavailable' : 'available';
            await techStatus.save();
        }

        res.status(200).json({
            success: true,
            message: `Booking ${action === 'accept' ? 'accepted' : 'declined'} successfully.`,
            booking
        });
    } 
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error responding to booking.' });
    }
};

exports.updateBookingStatusByTechnician = async (req, res) => {
    try{
        const bookingId = req.params.bookingId;
        const { status, notes } = req.body;
        const technicianId = req.user._id; 

        const booking = await Booking.findById(bookingId);
        if(!booking){
            return res.status(404).json({ message: 'Booking not found', success: false });
        }

        if(!booking.technicianId){
            return res.status(403).json({ message: 'Unauthorized: Not the assigned technician', success: false });
        }

        booking.status = status;
        if(notes) booking.notes = notes;
        await booking.save();

        const techStatus = await TechnicianStatus.findOne({ technicianId });
        if(techStatus){
            if(status === 'completed' || status === 'cancelled') {
                techStatus.status = 'available';
            } 
            else if(status === 'confirmed'){
                techStatus.status = 'unavailable';
            }
            await techStatus.save();
        }
        res.status(200).json({ message: 'Booking status updated successfully', success: true });
    } 
    catch(err){
        res.status(500).json({ message: 'Error updating booking status', success: false });
    }
};

exports.updateServiceTypeByTechnician = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { serviceType } = req.body;
        const technicianId = req.user._id;

        const booking = await Booking.findById(bookingId).populate('serviceType');
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        if (!booking.technicianId || booking.technicianId.toString() !== technicianId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized: Not assigned technician.' });
        }

        const service = await ServiceType.findById(serviceType);
        if (!service) {
            return res.status(404).json({ success: false, message: 'Please select service type.' });
        }

        let price = service.price;
        let duration = service.duration;


        // Log previous service
        const oldServiceName = booking.serviceType?.name || 'Unknown Service';
        const newServiceName = service.name;

        if (oldServiceName !== newServiceName) {
            booking.serviceChangeLogs.push({
                from: oldServiceName,
                to: newServiceName,
                changedAt: new Date()
            });
        }

        // Update booking
        booking.serviceType = serviceType;
        booking.price = price;
        booking.duration = duration;

        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Service type change successfully.',
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update service type.' });
    }
};

exports.getAvailableTimeSlots = async (req, res) => {
    try {
        const { date } = req.query;
        if(!date){
            return res.status(400).json({ message: 'Date is required', success: false });
        }

        const allSlots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','01:00 PM','02:00 PM','03:00 PM','04:00 PM'];

        const technicians = await User.find({ role: 'technician', isActive: true });
        const totalTechnicians = technicians.length;

        const availableSlots = [];

        for (let slot of allSlots) {
            const bookingsAtSlot = await Booking.countDocuments({ date, time: slot, status: { $in: ['pending', 'confirmed'] } });

            if (bookingsAtSlot < totalTechnicians) {
                availableSlots.push(slot);
            }
        }

        res.status(200).json({ success: true, availableSlots });

    } catch(err){
        res.status(500).json({ message: 'Failed to fetch available time slots', success: false });
    }
};

exports.getBookingHistoryByCustomer = async (req, res) => {
    try {
        const customerId = req.params.customerId;

        const bookings = await Booking.find({ customerId })
            .populate('serviceType') 
            .populate('technicianId')
            .populate('customerId')
            .sort({ createdAt: -1 });

        res.status(200).json({ bookings, success: true });
    } 
    catch(err){
        res.status(500).json({ message: 'Failed to fetch booking history', success: false });
    }
};

exports.cancelBookingByCustomer = async (req, res) => {
    try {
        const bookingId = req.params.bookingId;
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found', success: false });
        }

        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Booking cannot be cancelled.'
            });
        }

        // Get customer
        const customer = await User.findById(booking.customerId);

       

        // Check BEFORE cancel
        const MAX_CANCELLATIONS = 3;
        if (customer.cancellationCount >= MAX_CANCELLATIONS) {
            customer.isActive = false
             await customer.save();
            return res.status(403).json({
                success: false,
                message: `You have exceeded the allowed cancellation limit. Your account has been blocked. Please contact support for further assistance.`
            });
        }

        // Increase cancellation count
        customer.cancellationCount++;
        await customer.save();

        // Now cancel booking
        booking.status = 'cancelled';
        booking.cancelReason = 'Cancelled by customer';
        await booking.save();

        res.status(200).json({
            message: 'Booking cancelled successfully!',
            success: true,
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error cancelling booking', success: false });
    }
};

exports.uploadProof = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { receiptNumber } = req.body; 

        const booking = await Booking.findById(bookingId);
        if(!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.technicianId.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: 'Unauthorized: Not assigned technician' });

        if (req.file) {
            // req.file.path is a Cloudinary URL when using your upload.js
            booking.proofImages = [req.file.path]; // overwrite or push if array
        }

        if(receiptNumber) booking.receiptNumber = receiptNumber;

        await booking.save();

        res.status(200).json({ success: true, message: 'Proof uploaded successfully', booking });
    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error uploading proof' });
    }
};


exports.cancelBookingByTechnician = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body; 
        const technicianId = req.user._id;

        const booking = await Booking.findById(bookingId);
        if(!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if(booking.technicianId.toString() !== technicianId.toString()){
            return res.status(403).json({ success: false, message: 'Unauthorized: Not assigned technician' });
        }

        if(booking.status === 'completed' || booking.status === 'cancelled'){
            return res.status(400).json({ success: false, message: 'Booking cannot be cancelled.' });
        }

        const bookingDate = new Date(booking.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (bookingDate >= today) {
            return res.status(400).json({
                success: false,
                message: 'You can only cancel bookings that are in the past.'
            });
        }

        booking.status = 'cancelled';
        booking.cancelReason = reason ? `Cancelled by technician: ${reason}` : 'Cancelled by technician';
        await booking.save();

        const techStatus = await TechnicianStatus.findOne({ technicianId });
        if (techStatus) {
            techStatus.status = 'available';
            await techStatus.save();
        }

        res.status(200).json({ 
            success: true, 
            message: 'Booking cancelled successfully by technician.', 
            booking 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error cancelling booking by technician.' });
    }
};
