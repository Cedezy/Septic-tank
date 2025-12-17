import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; 
import { formatCurrency } from '../utils/FormatCurrency';
import { CalendarDays, ClipboardCheck, CreditCard, Image, Check, X, Clock, Building2, Wallet} from 'lucide-react';
import Loading from './Loading';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const Services = ({ showHomeOnly = false }) => {
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [step, setStep] = useState(1);
    const [bookingSummary, setBookingSummary] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        notes: '',
    });
    const [showDropdown, setShowDropdown] = useState(false);

    const allTimeSlots = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','01:00 PM','02:00 PM','03:00 PM','04:00 PM'];

    const handleScheduleClick = (service) => {
        if(!currentUser) {
            navigate('/signup');
            return;
        }
        setSelectedService(service);
    };

    const fetchCurrentUser = async () => {
        try{
            const response = await axios.get('/user/me', { 
                withCredentials: true 
            });
            setCurrentUser(response.data.user);
        } 
        catch(err){
            console.error('Failed to fetch user:', err);
        }
    };

    const fetchServices = async () => {
        try{
            const response = await axios.get('/service');
            setServices(response.data.services)
        }
        catch(err){
            console.log(err);
        }
        finally{
            setLoading(false);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === 'date') {
            fetchAvailableTimes(value); 
        }
    };

    const fetchAvailableTimes = async (selectedDate) => {
        try{
            const response = await axios.get(`/book/available-time?date=${selectedDate}`, {
                withCredentials: true,
            });
            setAvailableTimeSlots(response.data.availableSlots);
        }
        catch(err){
            console.log(err);
        }
    };

    const handleDateChange = (date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        setFormData(prev => ({ ...prev, date: formatted, time: '' })); 
        fetchAvailableTimes(formatted);
    };

    const handleContinueToSummary = (e) => {
        e.preventDefault();

        if(!formData.date || !formData.time){
            toast.error("Please select both date and time before proceeding.");
            return;
        }

        const price = selectedService.price;
        const duration = selectedService.duration;

        setBookingSummary({
            ...formData,
            service: selectedService,
            price,
            duration
        });

        toast.success('Proceed to payment');
        setStep(2);
    };  

    const handlePaymentConfirmation = async () => {
        if(!paymentMethod) return;
        setSubmitting(true);

        try{ 
            const response = await axios.post('/book', {
                date: formData.date,
                time: formData.time,
                serviceType: selectedService._id,
                price: bookingSummary.price,
                duration: selectedService.duration,
                paymentMethod,
                notes: formData.notes,   
            }, { withCredentials: true });
            toast.success(response.data.message);
            resetBookingForm();
        } 
        catch(err){
            
            toast.error(err.response?.data?.message);
        } 
        finally{
            setSubmitting(false);
        }
    };

    const resetBookingForm = () => {
        setSelectedService(null);
        setFormData({
            date: '',
            time: '',
            notes: '',
        });
        setStep(1);
        setPaymentMethod('');
    };

    useEffect(() => {
        fetchServices();
        fetchCurrentUser();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,   
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        arrows: true,      
        adaptiveHeight: true,
    };

    const getServicePrice = (service) => {
        return service.price ? formatCurrency(service.price) : '';
    };


    if(loading){
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loading/>
            </div>
        );
    }

    return (
        <div className='bg-gray-50 pt-28'>
            <div className="pb-10">
                <div className="max-w-4xl mx-auto text-center space-y-4">
               
                    <h1 className="text-4xl md:text-5xl text-gray-800 mb-6 uppercase tracking-tight">
                        Plan Your Septic Service
                    </h1>
                    <p className="text-s, text-gray-600 leading-relaxed">
                        Let our experienced team take the stress out of your septic system needs. Choose the service that fits you best, and we’ll handle the rest with professionalism, care, and attention to detail.
                    </p>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {services
                    .filter(service => service.status === 'Active' && (!showHomeOnly || service.showOnHome))
                    .map(service => (
                        <div  key={service._id} 
                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                            <div className="p-5 flex-grow">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800 leading-tight">
                                        {service.name}
                                    </h3>
                                </div>
                                <div>
                                    {service.images && service.images.length > 0 ? (
                                        <div className="relative">
                                            <Slider
                                            {...settings}
                                            className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                                            {service.images.map((img, i) => (
                                                <div key={`${service._id}-${i}`}>
                                                    <div className="relative group">
                                                        <img src={img} alt={`${service.name}-${i}`}
                                                        className="w-full h-64 object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                                                        {i + 1} / {service.images.length}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            </Slider>
                                        </div>
                                        ) : (
                                        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-green-50 rounded-xl border-2 border-dashed border-gray-300">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-4">
                                                <Image className="w-8 h-8 text-white" />
                                            </div>
                                            <div className='text-center'>
                                                 <p className="text-gray-500 text-lg font-medium">No images available</p>
                                                <p className="text-gray-400 text-sm mt-1">
                                                Images for this service will be displayed here soon.
                                                </p>
                                            </div>                              
                                        </div>
                                    )}

                                </div>
                                
                                <p className="text-gray-600 text-sm leading-relaxed mb-2 mt-4">
                                    {service.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                    <div className="text-2xl font-bold text-gray-800">
                                        {currentUser ? getServicePrice(service) : ''}
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0">
                                <button 
                                    onClick={() => handleScheduleClick(service)}
                                    className="w-full bg-green-500 hover:bg-green-600 ease-in-out duration-300 cursor-pointer text-white font-medium py-3 px-4 rounded-sm flex items-center justify-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    Book Service
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedService && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-1">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                        {step === 1 ? (
                            <>
                                <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <CalendarDays className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Book Service</h3>
                                                <p className="text-sm text-gray-300">{selectedService.name}</p>
                                            </div>
                                        </div>
                                       <button
                                            type="button"
                                            onClick={() => resetBookingForm()}
                                            className="text-gray-300 hover:text-white hover:bg-green-500 rounded-full p-2 transition-all duration-200 cursor-pointer"
                                            >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="px-6 py-6 overflow-y-auto flex-1">
                                    <form onSubmit={handleContinueToSummary} className="space-y-5">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-green-900">{selectedService.name}</h4>
                                                    <p className="text-sm text-green-700">Professional service booking</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center mb-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase">Booking Details</h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                        <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">1</span>
                                                        Date
                                                        <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <CalendarDays className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                                                        <input
                                                            type="date"
                                                            required
                                                            name="date"
                                                            value={formData.date}
                                                            onChange={(e) => handleDateChange(new Date(e.target.value))}
                                                            min={new Date().toISOString().split("T")[0]}
                                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm"
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Choose your preferred service date
                                                    </p>
                                                </div>

                                                <div className="relative w-full">
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                        Time <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div
                                                        className={`w-full border-2 border-gray-200 rounded-lg py-3 px-4 relative cursor-pointer ${
                                                            !formData.date ? 'bg-gray-100 cursor-not-allowed' : ''
                                                        }`}
                                                        onClick={() => {
                                                            if (formData.date) setShowDropdown(true);
                                                        }}
                                                    >
                                                        {formData.time || "Select time..."}
                                                    </div>
                                                </div>

                                                {showDropdown && (
                                                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                                                        <div 
                                                            className="bg-white rounded-sm animate-fade-in w-full max-w-md shadow-2xl transform transition-all animate-in zoom-in-95 duration-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {/* Header */}
                                                            <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
                                                                <div>
                                                                    <h3 className="text-xl font-semibold text-gray-900">Select Time</h3>
                                                                    <p className="text-sm text-gray-500 mt-0.5">Choose your preferred time slot</p>
                                                                </div>
                                                                <button 
                                                                    onClick={() => setShowDropdown(false)}
                                                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
                                                                    aria-label="Close modal"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>

                                                            {/* Time Slots */}
                                                            <div className="p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    {allTimeSlots.map((slot) => {
                                                                        const isDisabled = !availableTimeSlots.includes(slot);
                                                                        const isSelected = formData.time === slot;

                                                                        return (
                                                                            <button
                                                                                key={slot}
                                                                                onClick={() => {
                                                                                    if (!isDisabled) {
                                                                                        setFormData({ ...formData, time: slot });
                                                                                        setShowDropdown(false);
                                                                                    }
                                                                                }}
                                                                                disabled={isDisabled}
                                                                                className={`
                                                                                    relative py-3.5 px-4 rounded-xl text-sm font-medium 
                                                                                    transition-all duration-200 ease-in-out
                                                                                    ${isDisabled
                                                                                        ? 'bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                                                                        : isSelected
                                                                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105'
                                                                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:scale-102 active:scale-98'
                                                                                    }
                                                                                `}
                                                                            >
                                                                                <span className="relative z-10">{slot}</span>
                                                                                {isSelected && (
                                                                                    <div className="absolute top-1 right-1">
                                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    </div>
                                                                                )}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Footer hint */}
                                                            <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100">
                                                                <p className="text-xs text-gray-500 text-center">
                                                                    Unavailable slots are shown in gray
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Notes (optional)
                                            </label>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={handleInputChange}
                                                placeholder="Any special instructions?"
                                                className="w-full mt-2 pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-sm resize-none"
                                                rows={3}
                                            />
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-center gap-4">
                                        <div className="text-xs text-gray-500">
                                            Step 1 of 2 - Service details
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                type="button" 
                                                onClick={() => resetBookingForm()}
                                                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button  
                                                onClick={handleContinueToSummary}
                                                disabled={submitting} 
                                                className="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer text-sm"
                                            >
                                                {submitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Processing...
                                                    </div>
                                                ) : 'Continue'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="bg-green-600 p-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <ClipboardCheck className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">Confirm Booking</h3>
                                                <p className="text-sm text-gray-300">Review and confirm your service</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => resetBookingForm()}
                                            className="text-gray-300 hover:text-white hover:bg-green-500 rounded-full p-2 transition-all duration-200 cursor-pointer">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-2 overflow-y-auto flex-1">
                                    <div className="bg-white rounded-sm border-2 border-gray-200 overflow-hidden mb-6">
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-4 py-3 border-b border-gray-200">
                                            <h4 className="font-semibold text-gray-900">Booking Summary</h4>
                                            <p className="text-sm text-gray-500">Please review your service details</p>
                                        </div>
                                        
                                        <div className="p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Service</span>
                                                <span className="font-semibold text-sm text-gray-900">{bookingSummary.service.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Date</span>
                                                <span className="font-semibold text-sm text-gray-900">{bookingSummary.date}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Time</span>
                                                <span className="font-semibold text-sm text-gray-900">{bookingSummary.time}</span>
                                            </div>
                                            {bookingSummary.tankSize && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Tank Size</span>
                                                    <span className="font-semibold text-sm text-gray-900 capitalize">
                                                        {bookingSummary.tankSize} ({bookingSummary.capacity} Liters)
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Est. Duration</span>
                                                <span className="font-semibold text-sm text-gray-900">
                                                    {bookingSummary.duration} {bookingSummary.duration > 1 ? 'hours' : 'hour'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Contact Number</span>
                                                <span className="font-semibold text-sm text-gray-900">{formData.phone || currentUser?.phone || "N/A"}</span>
                                            </div>
                                            {currentUser && (  
                                                <div className="flex justify-between items-start gap-10">
                                                    <span className="text-sm text-gray-600">Address</span>
                                                    <span className="font-semibold text-gray-900 text-right text-sm">
                                                        {currentUser.street} {currentUser.barangay}, {currentUser.city}, {currentUser.province}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="border-t border-gray-200 pt-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                                    <span className="text-2xl font-bold text-green-600">{formatCurrency(bookingSummary.price)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center mb-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">Payment Method</h4>
                                        </div>
                                        
                                        <div>
                                            <div className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                                    paymentMethod === "cash" 
                                                        ? "border-green-500 bg-green-50" 
                                                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                                onClick={() => setPaymentMethod("cash")}>
                                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                    <Wallet className="w-5 h-5 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-sm text-gray-900">Cash Payment</div>
                                                    <div className="text-xs text-gray-500">Pay safely and easily in cash after the job is done.</div>
                                                </div>
                                                {paymentMethod === "cash" && (
                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500">
                                            Step 2 of 2 - Confirm and pay
                                        </div>
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => setStep(1)} 
                                                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handlePaymentConfirmation}
                                                disabled={!paymentMethod || submitting}
                                                className="px-6 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                {submitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    <div className="">
                                                        
                                                        Confirm
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Services;