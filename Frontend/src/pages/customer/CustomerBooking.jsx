import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import axios from '../../lib/axios';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { toast } from 'react-toastify';
import { getStatusBadge } from '../../utils/BookingStats';
import Footer from '../../components/Footer';
import Loading from '../../components/Loading';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/FormatCurrency';
import logo from '../../assets/logo.png'
import { 
    Star, 
    Clock, 
    CheckCircle, 
    AlertCircle, 
    Calendar, 
    X,
    MapPin,
    Phone,
    CreditCard,
    Timer,
    CalendarDays,
    StickyNote,
    Cylinder ,
    Wrench
} from 'lucide-react';
import {  
  Check, 
  Images, 
  Search,
  Info 
} from "lucide-react";
import { UserX, Printer, Users, FileText } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const CustomerBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showProofViewModal, setShowProofViewModal] = useState(false);
    const [proofImages, setProofImages] = useState([]);

    const fetchBookings = async () => {
        try{
            setLoading(true);
            const response = await axios.get('/book/customer', {
                withCredentials: true
            });
            setBookings(response.data.bookings);
            setFilteredBookings(response.data.bookings);
        } 
        catch(err){
            console.log(err);
        } 
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-amber-500" />;
            case 'confirmed':
                return <Calendar className="w-4 h-4 text-blue-600" />;
            case 'in-progress':
                return <Calendar className="w-4 h-4 text-yellow-600" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const cancelBooking = async (bookingId) => {
        try{
            const response = await axios.put(`/book/cancel/${bookingId}`, {}, {
                withCredentials: true
            });
            toast.success(response.data.message);
            fetchBookings();
            setShowCancelModal(false);
        }
        catch(err){
            console.log(err);
        }
    }
   
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Header />
                <div className='flex items-center justify-center min-h-screen'>
                    <Loading/>
                </div>
                <Footer/>
            </div>
        );
    }

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
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {bookings.length === 0 ? 'No bookings yet' : 'No matching bookings'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {bookings.length === 0
                                ? 'Your septic tank service appointments will appear here'
                                : 'Try adjusting your search or filter criteria'}
                            </p>
                            {bookings.length === 0 && (
                                <Link className='flex justify-center' to="/services">
                                    <button                               
                                        className="bg-green-500 hover:bg-green-600 ease-in-out duration-300 cursor-pointer text-white font-medium py-3 px-4 rounded-sm flex items-center justify-center gap-2">
                                        <CalendarDays className="w-4 h-4" />
                                            Schedule Service
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBookings.map((booking, index) => {
                            return (
                                <div key={booking._id || index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex w-full justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {booking.serviceType?.name}
                                                    </h3>
                                                    <p className="text-gray-500 text-sm">Service type</p>
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <div className={`flex justify-center items-center gap-1 ${getStatusBadge(booking.status)}`}>
                                                        {getStatusIcon(booking.status)}
                                                        <span className="capitalize">{booking.status}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xl font-semibold text-green-800">
                                                            {formatCurrency(booking.price)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='p-6'>  
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            <div className="flex items-center gap-3">
                                                <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Booked Date</p>
                                                    <p className="text-sm text-gray-600">{formatDate(booking.createdAt)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Service Date & Time</p>
                                                    <p className="text-sm text-gray-600">{shortFormatDate(booking.date)} at {booking.time}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Wrench className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Technician</p>
                                                    <p className="text-sm text-gray-600">
                                                        {booking?.technicianId?.fullname || 'Not assigned yet'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Technician Number</p>
                                                    <p className="text-sm text-gray-600">
                                                        {booking?.technicianId?.phone}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Timer className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900"> Est. Duration</p>
                                                    <p className="text-sm text-gray-600">
                                                        {booking.duration} {booking.duration > 1 ? 'hours' : 'hour'}
                                                    </p>
                                                </div>
                                            </div>
                                            {booking?.tankSize && (
                                                <div className="flex items-center gap-3">
                                                    <Cylinder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Tank size</p>
                                                        <p className="text-sm text-gray-600 capitalize">
                                                            {booking.tankSize} ({booking.capacity} Liters)
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="md:col-span-2 flex items-center gap-3">
                                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Location</p>
                                                    <p className="text-sm text-gray-600">
                                                        {booking.customerId?.street}, {booking.customerId?.barangay}, {booking.customerId?.city}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {booking?.notes && (
                                            <div className='mt-4'>
                                                <div className="flex items-center mb-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <h4 className="text-sm font-semibold text-gray-700 uppercase">Additional Notes</h4>
                                                </div>
                                                <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-sm">
                                                    <StickyNote className="w-4 h-4" />
                                                    <p className="text-sm text-yellow-800">{booking.notes}</p>
                                                </div>
                                            </div>
                                        )}
                                        {booking.status === 'pending' && (
                                            <div className='flex justify-end border-t border-gray-300 pt-4 mt-4'>
                                                <button
                                                    onClick={() => {
                                                        setShowCancelModal(true);
                                                        setSelectedBooking(booking);
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-sm cursor-pointer font-medium ease-in-out duration-300 border border-red-200 hover:border-red-300 text-sm uppercase">
                                                    Cancel Booking
                                                </button>
                                            </div>
                                        )}

                                        {booking.status === 'completed' && booking.proofImages?.length > 0 && (
                                            <div className="flex gap-2 justify-end border-t border-gray-300 mt-4 pt-4">
                                                <button
                                                    onClick={() => {
                                                        setProofImages(booking.proofImages);
                                                        setSelectedBooking(booking);
                                                        setShowProofViewModal(true);
                                                    }}
                                                    className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-sm font-medium hover:bg-green-600 ease-in-out duration-300 cursor-pointer text-sm"
                                                >
                                                    <Images className='w-4 h-4'/>
                                                    View Proof
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
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
                                    Keep Booking
                                </button>
                                <button
                                    onClick={() => cancelBooking(selectedBooking._id)}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-sm cursor-pointer hover:bg-red-700 transition-colors font-medium"
                                >
                                    Cancel Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showProofViewModal && selectedBooking && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white shadow-2xl rounded-sm w-full max-w-3xl animate-fade-in flex flex-col max-h-[90vh] overflow-hidden">
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
                                    <h2 className='font-bold text-2xl'>RMG SEPTIC TANK CLEANING SERVICES</h2>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">OFFICIAL RECEIPT</h2>
                                <p className="text-sm text-gray-500 mt-1">Official Booking Confirmation</p>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="text-gray-500">Receipt No.</p>
                                    <p className="font-mono font-bold text-gray-900">
                                        BOOK{selectedBooking._id.slice(-6).toUpperCase()}
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
                                            {formatDate(selectedBooking.date)} at {selectedBooking.time}
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
                                </div>
                            </div>

                            {/* Amount Section */}
                            <div className="mb-6 bg-gray-50 -mx-8 px-8 py-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">Service Amount</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(selectedBooking.price)}
                                    </span>
                                </div>
                            </div>

                            {/* Proof of Service Section */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200">
                                    Proof of Service
                                </h3>

                                {selectedBooking.status === "pending" && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 italic">No proof yet — booking is still pending.</p>
                                    </div>
                                )}

                                {selectedBooking.status === "confirmed" && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 italic">No proof yet — service is confirmed but not completed.</p>
                                    </div>
                                )}

                                {selectedBooking.status === "declined" && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 italic">No proof available — service was declined.</p>
                                    </div>
                                )}

                                {selectedBooking.status === "cancelled" && (
                                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-500 italic">No proof available — booking was cancelled.</p>
                                    </div>
                                )}

                                {(selectedBooking.status !== "pending" &&
                                    selectedBooking.status !== "confirmed" &&
                                    selectedBooking.status !== "cancelled" &&
                                    selectedBooking.proofImages.length > 0) && (
                                    <>
                                        <div className="mb-4">
                                            <p className="text-xs text-gray-600 bg-green-50 inline-block px-3 py-1 rounded-full">
                                                {selectedBooking.proofImages.length} image{selectedBooking.proofImages.length > 1 ? "s" : ""} attached
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {proofImages.map((img, index) => (
                                                <div
                                                    key={index}
                                                    className="group relative bg-white rounded-lg overflow-hidden border-2 border-gray-200 hover:border-green-400 transition-all duration-300"
                                                >
                                                    <div className="relative">
                                                        <img
                                                            src={`${BASE_URL}/${img}`}
                                                            alt={`Service Proof ${index + 1}`}
                                                            className="w-full h-56 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    </div>

                                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                        <button
                                                            type="button"
                                                            onClick={() => window.open(`${BASE_URL}/${img}`, "_blank")}
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

                                                    <div className="p-3 bg-white border-t border-gray-200">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-semibold text-gray-700">
                                                                Proof Image {index + 1}
                                                            </span>
                                                            <span className="text-xs text-gray-500 uppercase tracking-wide">
                                                                Evidence
                                                            </span>
                                                        </div>
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
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">Thank you for your business</p>
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
                                        Close Receipt
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