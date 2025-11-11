const Booking = require('../models/Booking');

exports.getCustomersFromBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('customerId', '-password') // includes address fields now
            .sort({ createdAt: -1 }); // newest bookings first

        const customerMap = new Map();

        bookings.forEach(booking => {
            const customer = booking.customerId;
            if (customer) {
                const customerId = customer._id.toString();

                if (!customerMap.has(customerId)) {
                    customerMap.set(customerId, {
                        ...customer.toObject(),
                        address: {
                            street: customer.street,
                            barangay: customer.barangay,
                            city: customer.city,
                            province: customer.province
                        },
                        totalBookings: 1,
                        lastBookingDate: booking.createdAt
                    });
                } else {
                    const existing = customerMap.get(customerId);
                    existing.totalBookings += 1;

                    if (booking.createdAt > existing.lastBookingDate) {
                        existing.lastBookingDate = booking.createdAt;
                    }
                    customerMap.set(customerId, existing);
                }
            }
        });

        // Convert map → array and sort by lastBookingDate
        const uniqueCustomers = Array.from(customerMap.values())
            .sort((a, b) => b.lastBookingDate - a.lastBookingDate);

        res.json({
            success: true,
            message: 'Customers from bookings fetched successfully.',
            customers: uniqueCustomers
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch customers from bookings.',
            error: err.message
        });
    }
};
