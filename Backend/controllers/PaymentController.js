const axios = require('axios');
const Booking = require('../models/Booking');
const Service = require('../models/ServiceType');

exports.initiateGcashPayment = async (req, res) => {
    const { amount, bookingDetails } = req.body;
    const userId = req.user._id;

    try {
        const service = await Service.findById(bookingDetails.serviceType);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Create checkout session
        const response = await axios.post('https://api.paymongo.com/v1/checkout_sessions', {
            data: {
                attributes: {
                    billing: {
                        name: bookingDetails?.fullname || req.user.fullname, 
                        email: bookingDetails?.email || req.user.email,
                    },
                    send_email_receipt: true,
                    show_description: true,
                    show_line_items: true,
                    line_items: [
                        {
                            name: service.name,
                            amount: amount * 100, 
                            currency: 'PHP',
                            quantity: 1,
                        },
                    ],
                    payment_method_types: ['gcash'],
                    description: 'Septic Tank Cleaning Services',
                    currency: 'PHP',
                    success_url: "http://localhost:5173/payment-success",
                    cancel_url: "http://localhost:5173/payment-failed",
                }
            }
        }, {
            headers: {
                Authorization: `Basic ${Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64')}`,
                'Content-Type': 'application/json'
            }
        });

        const checkout = response.data.data;

        // Save booking with checkout reference
        const booking = new Booking({
            customerId: userId,
            serviceType: bookingDetails.serviceType,
            date: bookingDetails.date,
            time: bookingDetails.time,
            tankSize: bookingDetails.tankSize,
            capacity: bookingDetails.capacity,
            duration: bookingDetails.duration,
            notes: bookingDetails.notes,
            paymentMethod: 'gcash',
            price: amount,
            paymongoCheckoutId: checkout.id,
            paymongoCheckoutUrl: checkout.attributes.checkout_url
        });

        await booking.save();

        res.status(200).json({ redirectUrl: checkout.attributes.checkout_url });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ message: 'Failed to create GCash checkout session', success: false });
    }
};

