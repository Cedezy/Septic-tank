import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import axios from '../../lib/axios';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/FormatCurrency';
import logo from '../../assets/logo.png';
import { 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    Calendar, 
    Phone, 
    CalendarDays, 
    Wrench, 
    Printer
} from 'lucide-react';

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const CustomerBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showProofViewModal, setShowProofViewModal] = useState(false);
    const [proofImages, setProofImages] = useState([]);
    const [activeTab, setActiveTab] = useState("bookings"); 

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/book/customer', { withCredentials: true });
            setBookings(response.data.bookings);
            setFilteredBookings(response.data.bookings);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const cancelBooking = async (bookingId) => {
        try {
            const response = await axios.put(`/book/cancel/${bookingId}`, {}, { withCredentials: true });
            toast.success(response.data.message);
            fetchBookings();
            setShowCancelModal(false);
        } catch(err) {
            if (err.response) {
                if (err.response.status === 403 || err.response.status === 400) {
                    toast.error(err.response.data.message);
                } else {
                    toast.error("Something went wrong.");
                }
            } else {
                toast.error("Server error");
            }
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Header />
                <div className='flex items-center justify-center min-h-screen'>
                    <Loading />
                </div>
            </div>
        );
    }

    // Transactions component
    // Transactions component
    const TransactionHistory = ({ bookings, setSelectedBooking, setShowProofViewModal, setProofImages }) => {
        const completedBookings = bookings.filter(b => b.status === "completed" && b.receiptNumber);

        if (completedBookings.length === 0) {
            return (
                <div className="text-center py-10">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                        <p className="text-gray-500 italic">No transactions yet.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {completedBookings.map((booking, index) => (
                    <div key={booking._id || index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex justify-between items-center">
                        <div>
                            <p className="text-gray-900 font-semibold">{booking.serviceType?.name}</p>
                            <p className="text-gray-500 text-sm">OR: {booking.receiptNumber}</p>
                            <p className="text-gray-500 text-sm">Date: {shortFormatDate(booking.date)}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                            <p className="text-green-600 font-semibold">{formatCurrency(booking.price)}</p>
                            <span className="text-xs text-gray-400">{booking.technicianId?.fullname}</span>

                            {booking.proofImages?.length > 0 && (
                                <button
                                    onClick={() => {
                                        setProofImages(booking.proofImages);
                                        setSelectedBooking(booking);
                                        setShowProofViewModal(true);
                                    }}
                                    className="mt-2 px-3 py-1 bg-green-500 text-white text-xs rounded-sm hover:bg-green-600 transition-colors"
                                >
                                    View Proof
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-50 pt-18">
            <Header />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div>
                            <h1 className="text-2xl uppercase font-bold tracking-tighter text-gray-700">Manage your Bookings</h1>
                            <p className="text-gray-600">View and manage your bookings</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-4 py-2 font-medium text-sm ${activeTab === "bookings" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                        onClick={() => setActiveTab("bookings")}
                    >Bookings</button>
                    <button
                        className={`ml-4 px-4 py-2 font-medium text-sm ${activeTab === "transactions" ? "border-b-2 border-green-500 text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                        onClick={() => setActiveTab("transactions")}
                    >Transactions</button>
                </div>

                {activeTab === "bookings" ? (
                    filteredBookings.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                                <p className="text-gray-500 italic">
                                    {bookings.length === 0 ? 'No bookings yet.' : 'No matching bookings.'}
                                </p>
                                {bookings.length === 0 && (
                                    <Link to="/services" className="mt-4 inline-block">
                                        <button className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-sm flex items-center gap-2">
                                            <CalendarDays className="w-4 h-4" /> Book Service
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredBookings.map((booking, index) => (
                                <div key={booking._id || index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Booking Header */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-200 flex justify-between items-center gap-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{booking.serviceType?.name}</h3>
                                            
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className='flex items-center gap-1'><span className="capitalize">{booking.status}</span></div>
                                            <p className="text-md font-semibold text-green-800 whitespace-nowrap">{formatCurrency(booking.price)}</p>
                                        </div>
                                    </div>
                                    {/* Booking Details */}
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        <div className="flex items-center gap-3">
                                            <CalendarDays className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Booked Date</p>
                                                <p className="text-sm text-gray-600">{formatDate(booking.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CalendarDays className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Service Date & Time</p>
                                                <p className="text-sm text-gray-600">{shortFormatDate(booking.date)} at {booking.time}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Wrench className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Technician</p>
                                                <p className="text-sm text-gray-600">{booking?.technicianId?.fullname || 'Not assigned yet'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Technician Number</p>
                                                <p className="text-sm text-gray-600">{booking?.technicianId?.phone || 'Not Assigned'}</p>
                                            </div>
                                        </div>
                                    </div>
                                 
                                    {booking.status === "pending" && (
                                        <div className="px-6 pb-6 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowCancelModal(true);
                                                }}
                                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-sm text-sm font-medium shadow-sm ease-in-out duration-300 cursor-pointer"
                                            >
                                                Cancel Booking
                                            </button>
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <TransactionHistory 
                        bookings={bookings} 
                        setSelectedBooking={setSelectedBooking}
                        setShowProofViewModal={setShowProofViewModal}
                        setProofImages={setProofImages}
                    />

                )}
            </div>

            {showCancelModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full animate-fade-in max-w-md shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Cancel Booking?</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to cancel this booking? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCancelModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-sm cursor-pointer hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => cancelBooking(selectedBooking._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-sm cursor-pointer hover:bg-red-700 transition-colors font-medium"
                                >
                                    Cancel 
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showProofViewModal && selectedBooking && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white shadow-2xl rounded-sm w-full max-w-full md:max-w-xl md:h-[90vh] animate-fade-in flex flex-col h-full overflow-hidden">
                        <div className="bg-white px-8 py-6 border-b-2 border-dashed border-gray-300 flex-shrink-0">
                            <div className="text-center mb-4">
                                <div className="flex justify-center mb-3">
                                    <img 
                                        className="h-20 w-auto object-contain" 
                                        src={logo} 
                                        alt="RMG Logo" 
                                    />
                                </div>
                                <div className="inline-flex items-center justify-center mb-3">
                                    <h2 className='font-bold text-lg md:text-2xl text-gray-800'>RMG SEPTIC TANK CLEANING SERVICES</h2>
                                </div>
                                <h2 className="text-md font-semibold text-gray-700">OFFICIAL RECEIPT</h2>
                                <p className="text-sm text-gray-500 mt-1">Official Booking Confirmation</p>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-gray-500">Receipt No.</p>
                                    <p className="font-mono font-bold text-gray-900">
                                        {selectedBooking.receiptNumber 
                                            ? selectedBooking.receiptNumber 
                                            : `BOOK${selectedBooking._id.slice(-6).toUpperCase()}`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-500">Status</p>
                                    <span className='capitalize font-medium text-sm'>
                                        {selectedBooking.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 overflow-y-auto bg-white">
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                                    Customer & Service Information
                                </h3>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Customer:</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {selectedBooking.customerId?.fullname}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Technician:</span>
                                        </div>
                                        <span className={`text-sm font-semibold ${
                                            selectedBooking.technicianId ? 'text-gray-900' : 'text-gray-400 italic'
                                        }`}>
                                            {selectedBooking.technicianId?.fullname || 'Not assigned'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Service Type:</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {selectedBooking.serviceType?.name || "N/A"}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Service Date:</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {formatDate(selectedBooking.date)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-gray-600">Service Time:</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">
                                            {selectedBooking.time}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Amount Section */}
                            <div className="bg-gray-50 -mx-8 px-8 py-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">Service Amount</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedBooking.price)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className='text-xs text-gray-400 italic'
                                >This reciept was given by 
                                <span className='font-semibold'> {selectedBooking.technicianId?.fullname}</span>
                                </span>
                            </div>

                            {/* Proof of Service Section */}
                            <div className='mt-6'>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                                    Proof of Service
                                </h3>

                                {(selectedBooking.status !== "pending" &&
                                    selectedBooking.status !== "confirmed" &&
                                    selectedBooking.status !== "cancelled" &&
                                    selectedBooking.proofImages.length > 0) && (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {proofImages.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-400 transition-all duration-300"
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={img}
                                                            alt={`Service Proof ${index + 1}`}
                                                            className="w-full h-56 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>

                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button
                                                            type="button"
                                                            onClick={() => window.open(`${img}`, "_blank")}
                                                            className="p-2.5 bg-white rounded-lg hover:bg-green-50 transition-colors duration-200 shadow-lg cursor-pointer"
                                                            title="View full size"
                                                        >
                                                            <svg
                                                                className="w-5 h-5 text-gray-700"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {(selectedBooking.status === "completed" &&
                                    selectedBooking.proofImages.length === 0) && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 italic">No proof uploaded for this completed booking.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Receipt Footer */}
                        <div className="bg-gray-50 px-8 py-4 border-t-2 border-dashed border-gray-300 flex-shrink-0">
                            <div className="flex justify-end items-center">
                              
                                <div className='flex justify-center items-center gap-2'>
                                    <button 
                                        onClick={() => window.print()}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm cursor-pointer hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>


                                    <button type="button"
                                        onClick={() => setShowProofViewModal(false)}
                                        className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer text-sm font-medium">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerBooking;
