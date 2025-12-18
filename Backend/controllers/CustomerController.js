const Booking = require('../models/Booking');

exports.getCustomersFromBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: 'completed' })
            .populate('customerId', '-password')
            .sort({ createdAt: -1 });

        const customerMap = new Map();

        bookings.forEach(booking => {
            const customer = booking.customerId;
            if (!customer) return;

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
                    totalBookings: 1
                });
            } else {
                const existing = customerMap.get(customerId);
                existing.totalBookings += 1;
                customerMap.set(customerId, existing);
            }
        });

        const uniqueCustomers = Array.from(customerMap.values());

        res.json({
            success: true,
            message: 'Customers with completed bookings fetched successfully.',
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
