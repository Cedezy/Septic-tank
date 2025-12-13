import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import SidebarTech from '../../components/SidebarTech';
import { toast } from 'react-toastify';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { formatCurrency } from '../../utils/FormatCurrency';
import { getStatusBadge } from '../../utils/BookingStats';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FileText,
  User,
  Building2,
  Clock,
  Calendar,
  StickyNote,
  XCircle,
  ChevronDown,
  Printer,
  Wrench,
  HeartPulse,
  AlertCircle,
  Briefcase,
  Phone, 
  MapPin, 
  X,
  Search, 
  FileWarning
} from "lucide-react";
import logo from '../../assets/logo.png'
const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const TechSchedule = () => {
    const [bookings, setBookings] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
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
    const [showReciept, setShowReciept] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [showChangeServiceModal, setShowChangeServiceModal] = useState(false);
    const [orNumber, setOrNumber] = useState('');
    const [showServiceTypeModal, setShowServiceTypeModal] = useState(false)

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

    const handleUpdateServiceType = async () => {

        try {
            const response = await axios.put(
                `/book/technician/service/${selectedBooking._id}`,
                { 
                    serviceType: selectedBooking.newServiceType,
                },
                { withCredentials: true }
            );

            toast.success(response.data.message);
            fetchBookings();
            setShowChangeServiceModal(false);
            setTimeout(() => {
                setSelectedBooking(null);
            }, 100);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message);
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
        setStartDate("")
        setEndDate("")
        setFilteredBookings(bookings);
    }, [filterType, bookings]);

    const isFutureDate = (date) => {
        const today = new Date();
        return new Date(date).setHours(0,0,0,0) > today.setHours(0,0,0,0);
    };

    const handleProofUpload = async () => {
        if(proofFiles.length === 0) {
            toast.warning("Please upload at least one proof image.");
            return;
        }

        const formData = new FormData();
        proofFiles.forEach(file => formData.append("proofImages", file));
        formData.append("receiptNumber", orNumber); // <-- send OR number

        try {
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

    const formatHours = (hrs) => {
        return `${hrs} hour${hrs > 1 ? "s" : ""}`;
    };

    return (
        <SidebarTech>
            <div className="max-w-7xl h-screen overflow-hidden mx-auto">    
                <div className='max-w-7xl mx-auto'>
                    <div className='flex flex-col gap-5'>
                        <div className="flex items-center justify-between">
                            <div className='leading-4 pl-4'>
                                <h1 className="text-xl md:text-3xl uppercase font-medium tracking-wider text-gray-700">My Service Schedules</h1>
                                <p className="text-gray-600 text-sm">View and manage your service schedules.</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-3 md:gap-2 items-stretch md:items-center px-4 md:px-0">
                            <div className="relative flex items-center">
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Search by</span>
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="w-full md:w-[200px] px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
                                >
                                    <option value="all">All</option>
                                    <option value="name">Customer Name</option>
                                    <option value="serviceType">Service Type</option>
                                    <option value="remarks">Remarks</option>  
                                    <option value="date">Date</option> 
                                </select>
                            </div>
                            
                            {filterType === "all" && (
                                <div className="relative w-full md:w-auto">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        value={search}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full md:w-[250px] px-8 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            )}

                            {filterType === "name" && (
                                <div className="relative w-full md:w-auto">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </span>
                                    <input
                                        type="text"
                                        placeholder="Search by customer name"
                                        value={search}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full md:w-[250px] px-8 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            )}

                            {filterType === "remarks" && (
                                <div className="flex flex-col md:flex-row gap-2 z-20 w-full md:w-auto">
                                    <div className="relative w-full md:w-[200px]">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Remarks
                                        </span>
                                        <div
                                            onClick={() => setShowRemarksDropdown(!showRemarksDropdown)}
                                            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between"
                                        >
                                            <span>{search || "Select Remarks"}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-900 transform transition-transform duration-200 ${
                                                    showRemarksDropdown ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>

                                        {showRemarksDropdown && (
                                            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-md z-20 animate-fadeIn">
                                                {["Pending", "Confirmed", "Completed", "Declined"].map((opt) => (
                                                    <div
                                                        key={opt}
                                                        onClick={() => {
                                                            setSearch(opt);
                                                            setStartDate(null);
                                                            setEndDate(null);
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

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex items-center flex-1 md:flex-initial">
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
                                                className="w-full md:w-[200px] pl-10 pr-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>

                                        <div className="relative flex items-center flex-1 md:flex-initial">
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
                                                className="w-full md:w-[200px] pl-10 pr-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filterType === "serviceType" && (
                                <div className="flex flex-col md:flex-row gap-2 z-20 w-full md:w-auto">
                                    <div className="relative w-full md:w-[300px]">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Service Type
                                        </span>
                                        <div
                                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                                            className="w-full px-3 py-2 border-2 border-gray-400 rounded-md text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between"
                                        >
                                            <span className="truncate">{search || "Select Service Type"}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-900 transform transition-transform duration-200 flex-shrink-0 ml-2 ${
                                                    showServiceDropdown ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>

                                        {showServiceDropdown && (
                                            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-sm shadow-md z-20 animate-fadeIn max-h-60 overflow-y-auto">
                                                {serviceTypes.map((service) => (
                                                    <div
                                                        key={service._id}
                                                        onClick={() => {
                                                            setSearch(service.name);
                                                            setStartDate(null); 
                                                            setEndDate(null);   
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

                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <div className="relative flex items-center flex-1 md:flex-initial">
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
                                                className="w-full md:w-[200px] pl-10 pr-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>

                                        <div className="relative flex items-center flex-1 md:flex-initial">
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
                                                className="w-full md:w-[200px] pl-10 pr-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {filterType === "date" && (
                                <div className="flex flex-col sm:flex-row gap-2 z-20">
                                    <div className="relative flex items-center flex-1">
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
                                            className="w-full pl-10 pr-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            dateFormat="MMMM d, yyyy"
                                        />
                                    </div>

                                    <div className="relative flex items-center flex-1">
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
                                            className="w-full pl-10 pr-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                    className="w-full md:w-[100px] px-5 py-2 bg-green-600 text-white rounded-sm cursor-pointer hover:bg-green-700 focus:ring-2 focus:ring-green-400 flex justify-center items-center gap-1 ease-in-out duration-300"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            )}
                        </div>
                                               
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Booking Id
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Customer Id
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            Customer Name
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service Type
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Official Reciept
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Service Date
                                        </th>
                                        <th className="px-4 sm:px-6 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Time
                                        </th>
                                        <th className="px-2 sm:px-4 py-4 sm:py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                                    <p className="text-gray-500">
                                                        Bookings will appear here once a customer submits a request.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <FileWarning className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No records found!
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        Try adjusting your search keywords.
                                                    </p>
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
                                                <td className="px-4 sm:px-5 py-4 sm:py-4 text-sm text-gray-800 font-mono font-medium">
                                                    BOOK{booking._id.slice(-4).toUpperCase()}
                                                </td>
                                                <td className="px-4 sm:px-5 py-4 sm:py-4 text-sm text-gray-800 font-mono font-medium">
                                                    CUST{booking.customerId._id.slice(-4).toUpperCase()}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                                    {booking.customerId?.fullname}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                                                    <div className="space-y-1 max-w-[200px] sm:max-w-none">
                                                    <div className="truncate">{booking.serviceType?.name}</div>
                                                        {booking.serviceChangeLogs?.length > 0 && (
                                                            <div className="text-xs text-gray-500 italic">
                                                                {`${booking.serviceChangeLogs[booking.serviceChangeLogs.length - 1].from} changed to ${booking.serviceChangeLogs[booking.serviceChangeLogs.length - 1].to} on ${new Date(booking.serviceChangeLogs[booking.serviceChangeLogs.length - 1].changedAt).toLocaleString()}`}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>


                                                <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {formatCurrency(booking.price)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm">
                                                    {booking.status === "completed" ? (
                                                        <span
                                                            className="text-blue-600 font-semibold underline cursor-pointer"
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setShowReciept(true);
                                                            }}
                                                        >
                                                            OR
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>  // or leave blank
                                                    )}
                                                </td>


                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {shortFormatDate(booking.date)}
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {booking.time}
                                                </td>
                                                <td className="px-2 sm:px-4 py-4">
                                                    {booking.status === "pending" && (
                                                        <span
                                                            className="text-blue-600 underline cursor-pointer font-medium"
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setShowPendingModal(true);
                                                            }}
                                                        >
                                                            Pending
                                                        </span>
                                                    )}

                                                    {booking.status === "confirmed" && (
                                                        <span className="text-sm text-gray-600 font-medium">Confirmed</span>
                                                    )}

                                                    {booking.status === "completed" && (
                                                        <span className="text-sm text-green-700 font-medium">Completed</span>
                                                    )}

                                                    {booking.status === "declined" && (
                                                        <span className="text-sm text-red-600 font-medium">Declined</span>
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
                                    
                {showPendingModal && selectedBooking && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fade-in">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">Manage Booking</h2>
                        </div>

                        {/* Content */}
                        <div className="px-6 py-5">
                            <p className="text-gray-600 text-sm leading-relaxed">
                            Choose an action for this booking. You can accept it, decline with a reason, or propose a different service.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="px-6 pb-6 space-y-2">
                            <button
                            className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={() => {
                                setActionToConfirm({ booking: selectedBooking, action: "accept" });
                                setShowPendingModal(false);
                            }}
                            >
                            
                            Accept Booking
                            </button>

                            <button
                            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={() => {
                                setShowChangeServiceModal(true);
                                setShowPendingModal(false);
                            }}
                            >
                         
                            Change Service
                            </button>

                            <button
                            className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                            onClick={() => {
                                setShowDeclineModal(true);
                                setShowPendingModal(false);
                            }}
                            >
                          
                            Decline Booking
                            </button>

                            <button
                            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors duration-200 mt-2"
                            onClick={() => {
                                setShowPendingModal(false)
                                setSelectedBooking(null)
                            }}
                            >
                            Cancel
                            </button>
                        </div>
                        </div>
                    </div>
                )}

                {showChangeServiceModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">Change Service</h2>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-5 space-y-4">
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Select a new service type and tank size (if applicable) for this booking.
                                </p>

                                {/* Service Type Select */}
                                <div className="relative w-full">
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                        Service Type <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div
                                        className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 cursor-pointer relative"
                                        onClick={() => setShowServiceTypeModal(true)}>
                                        {selectedBooking.serviceDetails?.name || "Select a service..."}
                                    </div>
                                </div>

                            </div>
                            {selectedBooking.serviceDetails && (
                                <div className="px-6 pb-2">
                                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                                        <p className="text-gray-700 font-semibold">
                                            Price: ₱{selectedBooking.serviceDetails.price}
                                        </p>
                                        <p className="text-gray-600 text-sm">
                                            Duration: {formatHours(selectedBooking.serviceDetails.duration)}
                                        </p>
                                    </div>
                                </div>
                            )}


                            <div className="px-6 pb-6 space-y-2">
                                <button
                                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors duration-200"
                                    onClick={handleUpdateServiceType}
                                >
                                    Confirm Change
                                </button>


                                <button
                                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors duration-200"
                                    onClick={() => setShowChangeServiceModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showServiceTypeModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                        <div className="bg-white rounded-md w-full max-w-md shadow-2xl transform transition-all">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Select Service Type</h3>
                                </div>
                                <button
                                    onClick={() => setShowServiceTypeModal(false)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* List */}
                            <div className="p-4 max-h-96 overflow-y-auto">
                                <div className="space-y-2">
                                    {serviceTypes.map((service) => (
                                        <button
                                            key={service._id}
                                            onClick={() => {
                                                setSelectedBooking({ 
                                                    ...selectedBooking, 
                                                    newServiceType: service._id, 
                                                    serviceDetails: service 
                                                });
                                                setShowServiceTypeModal(false);
                                            }}
                                            className="w-full group px-4 py-3.5 bg-white border-2 border-gray-100 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-medium text-gray-700 hover:text-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>{service.name}</span>
                                                <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                                <button
                                    className={`px-4 py-2 rounded text-white cursor-pointer ease-in-out duration-300 ${
                                        actionToConfirm.action === "decline"
                                        ? "bg-red-500 hover:bg-red-600"
                                        : "bg-green-500 hover:bg-green-600"
                                    }`}
                                    onClick={async () => {
                                        if (actionToConfirm.action === "complete") {
                                        setSelectedBooking(actionToConfirm.selectedBooking);
                                        setShowProofModal(true);
                                        } else {
                                        await handleRespond(
                                            actionToConfirm.booking._id,
                                            actionToConfirm.action
                                        );
                                        }
                                        setActionToConfirm(null);
                                    }}
                                    >
                                    {actionToConfirm.action === "accept"
                                        ? "Yes"
                                        : actionToConfirm.action === "complete"
                                        ? "Complete"
                                        : "Confirm"}
                                    </button>
                                <button
                                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                                    onClick={() => {
                                        // Close confirm modal
                                        setActionToConfirm(null);

                                        // Re-open the pending modal
                                        setShowPendingModal(true);
                                    }}
                                >
                                    No
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {showDeclineModal && selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white rounded-none md:rounded-sm shadow-2xl w-full md:max-w-3xl animate-fade-in flex flex-col h-screen md:max-h-[90vh] overflow-y-auto">
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
                                            <textarea
                                                value={declineReason}
                                                onChange={(e) => setDeclineReason(e.target.value)}
                                                placeholder="Provide details about the reason for declining"
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
                                <div className="flex justify-end items-center">
                                    <div className="flex space-x-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowDeclineModal(false);
                                                setActionToConfirm(null);
                                                setShowPendingModal(true);
                                                setDeclineReason("");
                                                setSelectedDeclineReason("");
                                            }}
                                            className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm"
                                        >
                                            Cancel
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
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                            
                            {/* Header */}
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

                            {/* Body */}
                            <div className="px-6 py-6 overflow-y-auto flex-1 space-y-6">
                                <div>   
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Customer Name <span className="text-red-500"></span>
                                    </label>
                                    <div>
                                        <h2 className='text-lg font-semibold'>Junneil Baroro</h2>
                                    </div>
                                </div>
                                {/* OR Number Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        OR Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={orNumber}
                                        onChange={(e) => setOrNumber(e.target.value)}
                                        placeholder="Enter Official Receipt number"
                                        className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                {/* Single Image Upload */}
                                <div>
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Select Image</h4>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors relative">
                                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 mb-2">Click to select image or drag and drop</p>
                                        <p className="text-sm text-gray-500">Only one file allowed</p>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setProofFiles([e.target.files[0]]); // overwrite with only one file
                                                }
                                            }}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Selected Image Preview */}
                                {proofFiles.length > 0 && (
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">
                                                Selected Image
                                            </h4>
                                        </div>
                                        <div className="relative w-48 aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50">
                                            <img
                                                src={URL.createObjectURL(proofFiles[0])}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-lg"></div>
                                            <div className="absolute top-2 right-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setProofFiles([])}
                                                    className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                                {(proofFiles[0].size / 1024 / 1024).toFixed(1)}MB
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 px-4 py-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex justify-end items-center gap-2">
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
                                        disabled={!proofFiles.length || !orNumber}
                                        className="px-4 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showModal && selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white rounded-none md:rounded-sm shadow-2xl w-full md:max-w-3xl animate-fade-in flex flex-col h-screen md:max-h-[90vh] overflow-y-auto">

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
                                            <label className="text-xs font-semibold text-gray-500 mb-1 block">Customer ID</label>
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <p className="text-sm font-medium text-gray-900 font-mono">
                                                    CUST{selectedBooking.customerId._id.slice(-4).toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
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
                                            onClick={() => {
                                                setShowModal(false)
                                                setSelectedBooking(null)
                                            }}
                                            className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm">
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showReciept && selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                        <div className="bg-white shadow-2xl rounded-sm w-full max-w-full md:max-w-xl animate-fade-in flex flex-col max-h-[90vh] md:h-auto overflow-hidden">
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
                                        <h2 className='font-bold text-md md:text-2xl text-gray-800'>RMG SEPTIC TANK CLEANING SERVICES</h2>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-700">OFFICIAL RECEIPT</h2>
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

                            {/* Receipt Body */}
                            <div className="px-8 py-6 overflow-y-auto bg-white">
                                {/* Customer & Service Details */}
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
                                                {formatDate(selectedBooking.date)}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-gray-600">Service Time:</span>
                                            </div>
                                            <span className='text-sm font-semibold text-gray-900'>
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
                                                {selectedBooking.proofImages.map((img, index) => (
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
                                <div className="flex justify-end items-center gap-2">
                                    <button 
                                        onClick={() => window.print()}
                                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm cursor-pointer hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                        >
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { 
                                            setSelectedBooking(null)
                                            setShowReciept(false)
                                        }}
                                        className="px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 transition cursor-pointer text-sm font-medium"
                                    >
                                        Close
                                    </button>
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