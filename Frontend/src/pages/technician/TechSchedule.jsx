import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import SidebarTech from '../../components/SidebarTech';
import { toast } from 'react-toastify';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { formatCurrency } from '../../utils/FormatCurrency';
import { getStatusBadge } from '../../utils/BookingStats';
import { ClipboardList, Mail, Phone, CalendarDays, MapPin, Eye, X } from 'lucide-react';
import { Search, FileWarning } from 'lucide-react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FileText,
  User,
  Building2,
  Clock,
  Package,
  Image,
  Calendar,
  StickyNote,
  XCircle,
  ChevronLeft,
  ChevronDown 
} from "lucide-react";
import { Wrench, HeartPulse } from "lucide-react";
import { AlertCircle, CheckCircle } from 'lucide-react';
import { EllipsisVertical } from "lucide-react";
import {
  Briefcase,
} from "lucide-react";
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const TechSchedule = () => {
    const [bookings, setBookings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showMapModal, setShowMapModal] = useState(false);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [search, setSearch] = useState('');
    const [actionToConfirm, setActionToConfirm] = useState(null); 
    const [showProofModal, setShowProofModal] = useState(false);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [proofFiles, setProofFiles] = useState([]);
    const [declineReason, setDeclineReason] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [showRemarksDropdown, setShowRemarksDropdown] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [selectedDeclineReason, setSelectedDeclineReason] = useState('');


    const fetchBookings = async () => {
        try{
            const response = await axios.get('/book/technician/assigned', { 
                withCredentials: true 
            });
            setBookings(response.data.bookings);
            setFilteredBookings(response.data.bookings);
        } 
        catch(err){
            console.log(err);
        }
    };

    const fetchServiceTypes = async () => {
        try {
            const response = await axios.get('/service', { 
                withCredentials: true 
            });
            setServiceTypes(response.data.services); 
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try{
            await axios.put(`/book/technician/update/${id}`, {status}, { 
                withCredentials: true 
            });
            fetchBookings();
            setSelectedBooking(null);
        } 
        catch(err){
            console.log(err);
        }
    };

    const handleRespond = async (bookingId, action, reason) => {
        try {
            const response = await axios.put(`/book/technician/respond/${bookingId}`, {
                action,
                reason
            }, {
                withCredentials: true
            });

            toast.success(response.data.message);
            fetchBookings(); 
            setShowDeclineModal(false);
            setDeclineReason("");
            setSelectedDeclineReason("");
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchServiceTypes();
    }, []);

    const handleSearch = () => {
        let filtered = [...bookings];
        const searchText = search.toLowerCase();

        filtered = filtered.filter((booking) => {
            const customerName = booking.customerId?.fullname?.toLowerCase() || "";
            const serviceName = booking.serviceType?.name?.toLowerCase() || "";
            const technicianName = booking.technicianId?.fullname?.toLowerCase() || "";
            const status = booking.status?.toLowerCase() || "";

            if (filterType === "name") {
                return customerName.includes(searchText);
            }

            if (filterType === "serviceType") {
                return serviceName.includes(searchText);
            }

            if (filterType === "technician") {
                return technicianName.includes(searchText);
            }

            if (filterType === "remarks") {
                return status.includes(searchText);
            }

            // Default search (when filterType = "all")
            return (
                customerName.includes(searchText) ||
                serviceName.includes(searchText) ||
                technicianName.includes(searchText) ||
                status.includes(searchText)
            );
        });

        // Apply date filter only if relevant
        if (
            filterType === "date" ||
            filterType === "technician" ||
            filterType === "serviceType" ||
            filterType === "remarks"
        ) {
            filtered = filtered.filter((booking) => {
                const bookingDate = new Date(booking.date);
                return (
                    (!startDate || bookingDate >= startDate) &&
                    (!endDate || bookingDate <= endDate)
                );
            });
        }

        // Sort so "pending" always appears first
        filtered.sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            return 0;
        });

        setFilteredBookings(filtered);
    };

    useEffect(() => {
        setSearch("");
        setFilteredBookings(bookings);
    }, [filterType, bookings]);


    const isToday = (dateStr) => {
        const today = new Date();
        const bookingDate = new Date(dateStr);
        return (
            today.getFullYear() === bookingDate.getFullYear() &&
            today.getMonth() === bookingDate.getMonth() &&
            today.getDate() === bookingDate.getDate()
        );
    };

    const isPastDate = (dateStr) => {
        const today = new Date();
        const bookingDate = new Date(dateStr);

        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);

        return bookingDate < today; 
    };

    const isFutureDate = (date) => {
        const today = new Date();
        return new Date(date).setHours(0,0,0,0) > today.setHours(0,0,0,0);
    };

    const isBookingSelected = !!selectedBooking;

    const handleProofUpload = async () => {
        if(proofFiles.length === 0) {
            toast.warning("Please upload at least one proof image.");
            return;
        }

        const formData = new FormData();
        proofFiles.forEach(file => formData.append("proofImages", file));

        try{
            await axios.post(`/book/technician/proof/${selectedBooking._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });
            await updateStatus(selectedBooking._id, "completed");
            toast.success("Proof uploaded and booking completed!");

            setShowProofModal(false);
            setProofFiles([]);
            setSelectedBooking(null);
            fetchBookings();

        } 
        catch(err){
            console.error(err);
        }
    };

    return (
        <SidebarTech>
            <div className="max-w-7xl mx-auto h-screen">    
                <div className='max-w-7xl mx-auto'>
                    <div className='flex flex-col gap-5 py-10'>
                        <div className="flex items-center justify-between">
                            <div className='leading-4 pl-4'>
                                <h1 className="text-xl md:text-3xl uppercase font-medium tracking-wider text-gray-700">My Service Schedules</h1>
                                <p className="text-gray-600 text-sm">View and manage your service schedules.</p>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center md:flex-row gap-3 items-center">
                            <div className="relative flex items-center gap-2">
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Search by</span>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer w-[200px]"
                                >
                                    <option value="all">All</option>
                                    <option value="name">Customer Name</option>
                                    <option value="serviceType">Service Type</option>
                                    <option value="remarks">Remarks</option>  
                                    <option value="date">Date</option> 
                                </select>
                            </div>

                            {filterType === "all" && (
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={search}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="px-8 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-sm"
                                    />
                                </div>
                            )}


                            {/* Customer Name */}
                            {filterType === "name" && (
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by customer name"
                                        value={search}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="px-8 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-sm"
                                    />
                                </div>
                            )}

                            {filterType === "remarks" && (
                                <div className="flex gap-2 z-50">
                                    <div className="relative">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Remarks
                                        </span>
                                        <div
                                            onClick={() => setShowRemarksDropdown(!showRemarksDropdown)}
                                            className="px-3 py-2 border-2 border-gray-400 rounded-md w-[200px] text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between"
                                        >
                                            <span>{search || "Select Remarks"}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-900 transform transition-transform duration-200 ${
                                                    showRemarksDropdown ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>

                                        {showRemarksDropdown && (
                                            <div className="absolute mt-1 w-[200px] bg-white border border-gray-200 rounded-sm shadow-md z-20 animate-fadeIn">
                                                {["Confirmed", "Completed", "Declined"].map((opt) => (
                                                    <div
                                                        key={opt}
                                                        onClick={() => {
                                                            setSearch(opt);
                                                            setShowRemarksDropdown(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date Range for Remarks */}
                                    <div className="relative flex items-center gap-2">
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-400 pointer-events-none">
                                                <Calendar className="w-5 h-5" />
                                            </span>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                placeholderText="From date"
                                                className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>

                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-400 pointer-events-none">
                                                <Calendar className="w-5 h-5" />
                                            </span>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                placeholderText="To date"
                                                className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filterType === "serviceType" && (
                                <div className="flex gap-2 z-50">
                                    <div className="relative">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Service Type
                                        </span>
                                        <div
                                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                                            className="px-3 py-2 border-2 border-gray-400 rounded-md w-[300px] text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between"
                                        >
                                            <span>{search || "Select Service Type"}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-900 transform transition-transform duration-200 ${
                                                    showServiceDropdown ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>

                                        {showServiceDropdown && (
                                            <div className="absolute mt-1 w-[300px] bg-white border border-gray-200 rounded-sm shadow-md z-20 animate-fadeIn">
                                                {serviceTypes.map((service) => (
                                                    <div
                                                        key={service._id}
                                                        onClick={() => {
                                                            setSearch(service.name);
                                                            setShowServiceDropdown(false);
                                                        }}
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    >
                                                        {service.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Date Range for Service Type */}
                                    <div className="relative flex items-center gap-2">
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-400 pointer-events-none">
                                                <Calendar className="w-5 h-5" />
                                            </span>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                placeholderText="From date"
                                                className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>

                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-gray-400 pointer-events-none">
                                                <Calendar className="w-5 h-5" />
                                            </span>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                placeholderText="To date"
                                                className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filterType === "date" && (
                                <div className="relative flex items-center gap-3">
                                    <div className="relative flex items-center">
                                        <span className="absolute left-3 text-gray-400 pointer-events-none">
                                            <Calendar className="w-5 h-5" />
                                        </span>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            selectsStart
                                            startDate={startDate}
                                            endDate={endDate}
                                            placeholderText="From date"
                                            className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            dateFormat="MMMM d, yyyy"
                                        />
                                    </div>

                                    <div className="relative flex items-center">
                                        <span className="absolute left-3 text-gray-400 pointer-events-none">
                                            <Calendar className="w-5 h-5" />
                                        </span>
                                        <DatePicker
                                            selected={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            selectsEnd
                                            startDate={startDate}
                                            endDate={endDate}
                                            minDate={startDate}
                                            placeholderText="To date"
                                            className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            dateFormat="MMMM d, yyyy"
                                        />
                                    </div>
                                </div>  
                            )}


                            {(filterType === "name" ||
                                filterType === "all" ||
                                filterType === "remarks" ||
                                filterType === "serviceType" ||
                                filterType === "date") && (
                                <button
                                    onClick={handleSearch}
                                    className="px-5 py-2 bg-green-600 text-white rounded-sm cursor-pointer hover:bg-green-700 focus:ring-2 focus:ring-green-400 flex justify-center items-center gap-1 ease-in-out duration-300"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            )}
                        </div>
                                               
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 max-h-[500px] overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Booking Id
                                        </th>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service Type
                                        </th>
                                        <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Remarks
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <FileWarning className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No bookings yet
                                                    </h3>
                                                    <p className="text-gray-500">Bookings will appear here once a customer submits a request.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredBookings.map((booking) => (
                                            <tr key={booking._id}
                                                className={`hover:bg-gray-100 ease-in-out duration-300 cursor-pointer ${
                                                selectedBooking?._id === booking._id ? "!bg-green-100" : ""
                                                }`}
                                                onDoubleClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowModal(true);
                                                }}>
                                                <td className="px-5 py-4 text-sm text-gray-800 font-mono font-medium">
                                                    BOOK{booking._id.slice(-4).toUpperCase()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {booking.customerId?.fullname}
                                                </td>
                                                <td className="px-6 py-6 text-sm text-gray-900">
                                                    {booking.serviceType?.name}
                                                </td>
                                                <td className="py-6 text-sm text-gray-900">
                                                    {formatCurrency(booking.price)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(booking.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {booking.time}
                                                </td>
                                                <td className="px-2 py-4">
                                                    {booking.status === "pending" && (
                                                        <div className="flex gap-2">
                                                        {/* ✅ ACCEPT BUTTON */}
                                                        <button
                                                            className="px-3 py-1 bg-green-600 text-white rounded-sm text-sm hover:bg-green-700 cursor-pointer"
                                                            onClick={() => setActionToConfirm({ booking, action: "accept" })}
                                                        >
                                                            Accept
                                                        </button>

                                                        {/* ✅ DECLINE BUTTON (already fine) */}
                                                        <button
                                                            className="px-3 py-1 bg-red-600 text-white rounded-sm text-sm hover:bg-red-700 cursor-pointer"
                                                            onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setShowDeclineModal(true);
                                                            }}
                                                        >
                                                            Decline
                                                        </button>
                                                        </div>
                                                    )}

                                                    {booking.status === "confirmed" && (
                                                        <span className="text-sm text-gray-600 font-medium">Confirmed</span>
                                                    )}

                                                    {booking.status === "completed" && (
                                                        <span className="text-sm text-green-700 font-medium italic">Completed</span>
                                                    )}

                                                    {booking.status === "declined" && (
                                                        <span className="text-sm text-red-600 font-medium italic">Declined</span>
                                                    )}

                                                    {booking.status === "cancelled" && (
                                                        <span className={`capitalize ${getStatusBadge(booking.status)}`}>
                                                        Cancelled
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>  
                    </div>
                </div>
            
                {actionToConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4"
                        onClick={(e) => {
                        if(e.target === e.currentTarget) setActionToConfirm(null);
                        }}>
                        <div className="bg-white rounded-md animate-fade-in shadow-lg max-w-md w-full p-6 border border-gray-300">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                {actionToConfirm.action === "accept"
                                ? "Accept Booking"
                                : "Complete Booking"}
                            </h2>

                            <p className="text-gray-600 mb-6">
                                {actionToConfirm.action === "accept" && (
                                    <>
                                        Are you sure you want to{" "}
                                        <span className="font-medium text-green-600">accept</span> this
                                        booking?
                                    </>
                                )}
                                {actionToConfirm.action === "complete" && (
                                    <>
                                        Are you sure you want to mark this booking as{" "}
                                        <span className="font-medium text-green-600">completed</span>?
                                    </>
                                )}
                            </p>

                            <div className="flex justify-end gap-2">
                                <button className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer ease-in-out duration-300"
                                onClick={() => setActionToConfirm(null)}>
                                    Cancel
                                </button>

                                <button className={`px-4 py-2 rounded text-white cursor-pointer ease-in-out duration-300 ${
                                    actionToConfirm.action === "decline"
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-green-500 hover:bg-green-600"
                                }`}
                                onClick={async () => {
                                    if(actionToConfirm.action === "complete"){
                                        setSelectedBooking(actionToConfirm.selectedBooking);
                                        setShowProofModal(true);
                                    } 
                                    else{
                                        await handleRespond(
                                            actionToConfirm.booking._id,
                                            actionToConfirm.action
                                        );
                                    }
                                    setActionToConfirm(null);
                                }}>
                                Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {showDeclineModal && selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="bg-orange-500 px-6 py-4 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
                                            <XCircle className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Decline Booking</h3>
                                            <p className="text-sm text-orange-100">
                                                Please provide reason for declining
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto flex-1">
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900">Decline Reason</h4>
                                            <p className="text-sm text-gray-600">
                                                Select the reason for declining this booking
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 px-3 py-1 rounded-full">
                                            <span className="text-sm font-medium text-orange-700">Required</span>
                                        </div>
                                    </div>

                                    {/* REASON OPTIONS */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                        {[
                                            { icon: <Calendar className="w-5 h-5 text-orange-500" />, title: "Schedule Conflict", desc: "Unable to meet scheduled time" },
                                            { icon: <MapPin className="w-5 h-5 text-orange-500" />, title: "Too Far", desc: "Client location is out of range" },
                                            { icon: <Briefcase className="w-5 h-5 text-orange-500" />, title: "Overloaded Work", desc: "Too many tasks at the moment" },
                                            { icon: <Wrench className="w-5 h-5 text-orange-500" />, title: "Insufficient Tools", desc: "Missing tools for this service" },
                                            { icon: <HeartPulse className="w-5 h-5 text-orange-500" />, title: "Not Feeling Well", desc: "Unable to work due to health reasons" },
                                            { icon: <FileText className="w-5 h-5 text-orange-500" />, title: "Other Reason", desc: "Specify in details below" },
                                        ].map((reason, index) => (
                                            <div
                                                key={index}
                                                className={`group relative bg-white rounded-xl p-4 shadow-sm border ${
                                                    selectedDeclineReason === reason.title
                                                        ? "border-orange-400 ring-1 ring-orange-300"
                                                        : "border-gray-200"
                                                } hover:shadow-lg hover:border-orange-300 transition-all duration-300 cursor-pointer`}
                                                onClick={() => setSelectedDeclineReason(reason.title)}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {reason.icon}
                                                    <div className="flex-1">
                                                        <h5 className="text-sm font-medium text-gray-900">{reason.title}</h5>
                                                        <p className="text-xs text-gray-500">{reason.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* ADDITIONAL DETAILS — only show if "Other Reason" */}
                                    {selectedDeclineReason === "Other Reason" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Additional Details
                                            </label>
                                            <textarea
                                                value={declineReason}
                                                onChange={(e) => setDeclineReason(e.target.value)}
                                                placeholder="Provide more details about the reason for declining..."
                                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none"
                                                rows="4"
                                            ></textarea>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Providing a reason helps us better understand your situation
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex justify-between items-center">
                                    <div className="text-xs text-gray-500">
                                        This action cannot be undone
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDeclineModal(false);
                                                setDeclineReason("");
                                                setSelectedDeclineReason("");
                                            }}
                                            className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm"
                                        >
                                            Keep Booking
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRespond(
                                                selectedBooking._id,
                                                "decline",
                                                selectedDeclineReason === "Other Reason" ? declineReason : selectedDeclineReason
                                                )
                                            }
                                            disabled={
                                                !selectedDeclineReason || 
                                                (selectedDeclineReason === "Other Reason" && declineReason.trim() === "")
                                            }
                                            className={`px-6 py-2 rounded-sm text-sm transition cursor-pointer ${
                                                !selectedDeclineReason || 
                                                (selectedDeclineReason === "Other Reason" && declineReason.trim() === "")
                                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                : "bg-orange-500 text-white hover:bg-orange-600"
                                            }`}
                                            >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showProofModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-white" />
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Upload Service Proof</h3>
                                            <p className="text-sm text-gray-300">Provide completion evidence</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowProofModal(false)}
                                        className="text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg p-2 transition-all duration-200 cursor-pointer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                </div>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto flex-1">
                                

                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Select Images</h4>
                                    </div>
                                    
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative">
                                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                            </svg>
                                        </div>

                                        <p className="text-gray-600 mb-2">Click to select images or drag and drop</p>
                                        <p className="text-sm text-gray-500">Multiple files supported</p>

                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={(e) => {
                                        if (e.target.files) {
                                            const newFiles = Array.from(e.target.files);
                                            setProofFiles((prev) => {
                                            const existingNames = prev.map((f) => f.name);
                                            const filtered = newFiles.filter((f) => !existingNames.includes(f.name));
                                            return [...prev, ...filtered];
                                            });
                                        }
                                        }}

                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        </div>

                                </div>

                                {proofFiles && proofFiles.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center mb-4">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">Selected Images ({proofFiles.length}/5)</h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {proofFiles.map((file, index) => (
                                                <div key={index} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                                                        <img
                                                            src={URL.createObjectURL(file)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg"></div>
                                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newFiles = proofFiles.filter((_, i) => i !== index);
                                                            setProofFiles(newFiles);
                                                        }}
                                                        className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>

                                                    </div>
                                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                        {(file.size / 1024 / 1024).toFixed(1)}MB
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload Status */}
                                {proofFiles && proofFiles.length > 0 && (
                                    <div className="border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-3 h-3 text-yellow-500" />
                                            </div>

                                            <p className="text-sm text-green-700">
                                                Ready to upload {proofFiles.length} image{proofFiles.length !== 1 ? 's' : ''} as service completion proof
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex justify-between items-center gap-4">
                                    <div className="text-xs text-gray-500">
                                        Upload proof images to complete service
                                    </div>
                                    <div className="flex space-x-2 whitespace-nowrap">
                                        <button
                                            type="button"
                                            onClick={() => setShowProofModal(false)}
                                            className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleProofUpload}
                                            disabled={!proofFiles || proofFiles.length === 0}
                                            className="px-4 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                                Upload & Complete
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showModal && selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-3xl animate-fade-in flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">Booking Details</h3>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 overflow-y-auto">
                                <div className="mb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-500">Current Status</span>
                                        <span className={`capitalize ${getStatusBadge(selectedBooking.status)}`}>
                                            {selectedBooking.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="mb-4 border-b border-gray-300 pb-4">
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Customer Information</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Customer Name</label>
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedBooking.customerId?.fullname}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Contact Number</label>
                                            <div className="flex items-center space-x-2">
                                                <Phone className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedBooking.customerId?.phone}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Amount</label>
                                            <p className="text-sm font-bold text-green-600">
                                                {formatCurrency(selectedBooking.price)}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Address</label>
                                            <div className="flex items-start space-x-2">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedBooking.customerId?.street}, {selectedBooking.customerId?.barangay}, {selectedBooking.customerId?.city}, {selectedBooking.customerId?.province}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='border-b border-gray-300 pb-4'>
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Service Details</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Type</label>
                                            <div className="flex items-center space-x-2">
                                                <Building2 className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">{selectedBooking.serviceType?.name}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Booking Date</label>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">{shortFormatDate(selectedBooking.createdAt)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Date</label>
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">{shortFormatDate(selectedBooking.date)}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Time</label>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">{selectedBooking.time}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
                                            <div className="flex items-center space-x-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900">
                                                    {selectedBooking.duration} {selectedBooking.duration > 1 ? 'hours' : 'hour'}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedBooking.tankSize && (
                                            <div className='col-span-2'>
                                                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tank Specifications</label>
                                                <div className="flex items-center space-x-2">
                                                    <Package className="w-4 h-4 text-gray-500" />
                                                    <p className="text-sm font-medium text-gray-900 capitalize">
                                                        {selectedBooking.tankSize} ({selectedBooking.capacity} Liters)
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>  
                                {selectedBooking.notes && (
                                    <div className='mt-4'>
                                        <div className="flex items-center mb-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">Additional Notes</h4>
                                        </div>
                                        <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-sm">
                                            <StickyNote className="w-4 h-4" />
                                            <p className="text-sm text-yellow-800">{selectedBooking.notes}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedBooking.status === 'cancelled' && selectedBooking.cancelReason && (
                                    <div className="mt-4">
                                        <div className="flex items-center mb-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase">
                                                    Cancellation Reason
                                                </h4>
                                            </div>
                                            <div className="flex items-center space-x-2 bg-red-50 p-3 rounded-sm">
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            <p className="text-sm text-red-700">{selectedBooking.cancelReason}</p>
                                        </div>
                                    </div>
                                )}

                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex justify-end md:justify-between items-center gap-10">
                                    <span className="text-xs text-gray-500 hidden md:block">Complete booking information and service details</span>
                                    <div className='flex justify-center gap-2 whitespace-nowrap'>
                                        <button
                                            disabled={!isBookingSelected}
                                            className='flex items-center gap-2 px-5 py-2 rounded-sm bg-green-500 hover:bg-green-600 text-white ease-in-out duration-300 shadow-sm hover:shadow-md font-medium text-sm cursor-pointer'
                                            onClick={() => {
                                                setShowMapModal(true)
                                                setShowModal(false)
                                            }}>
                                            <MapPin className="w-4 h-4" />
                                            View Map
                                        </button>
                                        {selectedBooking.status === 'confirmed' && !isFutureDate(selectedBooking.date) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActionToConfirm({ selectedBooking, action: "complete" });
                                                    setShowModal(false);
                                                }}
                                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 cursor-pointer text-white rounded-sm text-sm transition"
                                            >
                                                Show Proof Images
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showMapModal && selectedBooking && (
                    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4"
                        onClick={(e) => {
                            if(e.target === e.currentTarget) setShowMapModal(false);
                        }}>
                        <div className="bg-white rounded-sm shadow-xl w-full max-w-5xl animate-fade-in relative">
                            <div className="bg-green-600 px-6 py-4 rounded-sm">
                                <div className="flex justify-between items-center">
                                    <div className='flex gap-2 justify-center items-center'>
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-white" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white">Customer Location</h2>
                                    </div>
                                    <button
                                        onClick={() => setShowMapModal(false)}
                                        className="text-gray-200 hover:text-gray-100 hover:bg-green-500 ease-in-out duration-300 rounded-full p-2 cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="w-full h-[400px] rounded-lg overflow-hidden border">
                                    <iframe
                                        title="Google Map"
                                        width="100%"
                                        height="100%"
                                        loading="lazy"
                                        allowFullScreen
                                        style={{ border: 0 }}
                                        src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${selectedBooking.customerId?.street}, ${selectedBooking.customerId?.barangay}, ${selectedBooking.customerId?.city}, ${selectedBooking.customerId?.province}`)}`}
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </SidebarTech>
    );
};

export default TechSchedule;