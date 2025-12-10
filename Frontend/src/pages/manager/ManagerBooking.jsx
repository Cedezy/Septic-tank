import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../../lib/axios'
import SidebarManager from '../../components/SidebarManager';
import HeaderAdmin from '../../components/HeaderAdmin';
import { toast } from 'react-toastify';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { formatCurrency } from '../../utils/FormatCurrency';
import { getStatusBadge } from '../../utils/BookingStats';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRef } from 'react';
import { handlePrint } from '../../utils/PrintUtils';
import {
  FileText,
  AlertCircle,
  Search,
  User,
  Users,
  FileWarning,
  Phone,
  MapPin,
  Building2,
  Clock,
  Wrench,
  Calendar,
  StickyNote,
  Fingerprint,
  Printer,
  ChevronDown
} from "lucide-react";

const ManagerBooking = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState("all");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedServiceType, setSelectedServiceType] = useState("");
    const [selectedTechnician, setSelectedTechnician] = useState("");
    const [selectedRemarks, setSelectedRemarks] = useState("");
    const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
    const [showTechModal, setShowTechModal] = useState(false);
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [showRemarksDropdown, setShowRemarksDropdown] = useState(false);
    const [showTechDropdown, setShowTechDropdown] = useState(false);
    const [showTechUnavailableModal, setShowTechUnavailableModal] = useState(false);
    const [unavailableTechName, setUnavailableTechName] = useState("");
    const [isManager, setIsManager] = useState('');
    const printRef = useRef();

    useEffect(() => {
        const fetchManagerData = async () => {
            try{
                const response = await axios.get('user/me', {
                    withCredentials: true
                });
                setIsManager(response.data.user)
            }
            catch(err){
                console.log(err);
            }
        }
        fetchManagerData();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/book', { withCredentials: true });
            setBookings(response.data.bookings);
        } catch (err) {
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

    const fetchTechnician = async () => {
        try{
            const response = await axios.get('/user/technician', {
                withCredentials: true
            });
            setTechnicians(response.data.users);
        }
        catch(err){
            console.log(err);
        }
    }

    useEffect(() => {
        fetchBookings();
        fetchTechnician();
        fetchServiceTypes();
    }, [])

    const handleAssignTechnician = async (bookingId, technicianId) => {
    try {
        const response = await axios.put(
            `/book/assign/${bookingId}`,
            { technicianId },
            { withCredentials: true }
        );

        fetchBookings();
        toast.success(response.data.message);
        setShowTechModal(false);
        setSelectedTechnicianId(null);
        setSelectedBooking(null);
    } catch (err) {
        if (err.response && err.response.status === 400) {
            setUnavailableTechName(
                technicians.find((tech) => tech._id === technicianId)?.fullname || ""
            );
            setShowTechUnavailableModal(true);
        } else {
            console.error(err);
            toast.error("Failed to assign technician.");
        }
    }
};


    useEffect(() => {
        const sorted = [...bookings].sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            return 0;
        });
        setFilteredBookings(sorted);
    }, [bookings]);


    const handleSearch = () => {
            let filtered = bookings;
    
            if(filterType !== "all" && search.trim() !== ""){
                const searchText = search.toLowerCase();
    
                if(filterType === "name"){
                    filtered = filtered.filter((b) =>
                        b.customerId?.fullname?.toLowerCase().includes(searchText)
                    );
                } 
                else if(filterType === "remarks"){
                    filtered = filtered.filter((b) =>
                        b.status?.toLowerCase().includes(searchText)
                    );
                } 
                else if(filterType === "serviceType"){
                    filtered = filtered.filter((b) =>
                        b.serviceType?.name?.toLowerCase().includes(searchText)
                    );
                } 
                else if(filterType === "technician"){
                    filtered = filtered.filter((b) =>
                        b.technicianId?.fullname?.toLowerCase().includes(searchText)
                    );
                }
            } 
            else if(filterType === "all" && search.trim() !== ""){
                const searchText = search.toLowerCase();
                filtered = filtered.filter(
                (b) =>
                    b.customerId?.fullname?.toLowerCase().includes(searchText) ||
                    b.serviceType?.name?.toLowerCase().includes(searchText) ||
                    b.technicianId?.fullname?.toLowerCase().includes(searchText) ||
                    b.status?.toLowerCase().includes(searchText)
                );
            }
    
            filtered = filtered.filter((b) => {
                const bookingDate = new Date(b.date);
                return (
                    (!startDate || bookingDate >= startDate) &&
                    (!endDate || bookingDate <= endDate)
                );
            });
    
            const sorted = filtered.sort((a, b) => {
                if(a.status === "pending" && b.status !== "pending") return -1;
                if(a.status !== "pending" && b.status === "pending") return 1;
                return 0;
            });
            setFilteredBookings(sorted);
        };
    
        useEffect(() => {
            setSearch("");
            setStartDate("");
            setEndDate("");
    
            setSelectedServiceType("");
            setSelectedTechnician("");
            setSelectedRemarks("");
    
            setFilteredBookings(bookings);
        }, [
            filterType,
            bookings,
            selectedServiceType,
            selectedTechnician,
            selectedRemarks,
        ]);


    return (
        <div className="h-screen flex overflow-hidden">
            <div className='w-full'>
                <HeaderAdmin />
                <SidebarManager isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='px-6 pb-4 flex flex-col gap-5 h-screen pt-40'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter font-medium uppercase text-gray-700'>
                                Customer Bookings
                            </span>
                        </div>
                        <div className="flex flex-col justify-center md:flex-row gap-2 items-center">
                            <div className="relative flex items-center gap-2"> 
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Search by</span> 
                                <select value={filterType} 
                                    onChange={(e) => {
                                        setFilterType(e.target.value);
                                       
                                    }}
                                    className="px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer w-[200px]"> 
                                    <option value="all">All</option> 
                                    <option value="name">Customer Name</option> 
                                    <option value="serviceType">Service Type</option> 
                                    <option value="technician">Technician Name</option> 
                                    <option value="remarks">Remarks</option>      
                                    <option value="date">Date</option> 
                                </select> 
                            </div>

                            {filterType === "all" && (
                                <div className="relative flex items-center gap-2">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="w-4 h-4 text-gray-400" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                            className="px-8 py-2 border-2 border-gray-400 rounded-md w-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                </div>
                            )}


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
                                <div className='flex gap-2'>
                                    <div className="relative">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Remarks
                                        </span>
                                        <div onClick={() => setShowRemarksDropdown(!showRemarksDropdown)}
                                            className="px-3 py-2 border-2 border-gray-400 rounded-md w-[180px] text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between">
                                            <span>{search || "Select Remarks"}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-900 transform transition-transform duration-200 ${
                                                showRemarksDropdown ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>

                                        {showRemarksDropdown && (
                                            <div className="absolute mt-1 w-[180px] bg-white border border-gray-200 rounded-sm shadow-md z-20 animate-fadeIn">
                                                {["Pending", "Confirmed", "Completed", "Declined", "Cancelled"].map(
                                                    (opt) => (
                                                        <div key={opt}
                                                            onClick={() => {
                                                                setSearch(opt);
                                                                setStartDate(null);
                                                                setEndDate(null);
                                                                setShowRemarksDropdown(false);
                                                            }}

                                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                            {opt}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="relative flex items-center gap-2 z-50">
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

                            {filterType === "technician" && (
                                <div className='flex gap-2 z-50'>
                                    <div className="relative">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Technician
                                        </span>
                                        <div onClick={() => setShowTechDropdown(!showTechDropdown)}
                                            className="px-3 py-2 border-2 border-gray-400 rounded-md w-[200px] text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between">
                                            <span>{search || "Select Technician"}</span>
                                            <ChevronDown
                                                className={`w-4 h-4 text-gray-900 transform transition-transform duration-200 ${
                                                showTechDropdown ? "rotate-180" : ""
                                                }`}
                                            />
                                        </div>
                                    
                                        {showTechDropdown && (
                                            <div className="absolute mt-1 w-[200px] bg-white border border-gray-200 rounded-sm shadow-md z-20 animate-fadeIn">
                                                {technicians.map((tech) => (
                                                    <div key={tech._id}
                                                        onClick={() => {
                                                            setSearch(tech.fullname);
                                                            setStartDate(null);
                                                            setEndDate(null);
                                                            setShowTechDropdown(false);
                                                        }}

                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                        {tech.fullname}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                                <div className='flex gap-2 z-50'>
                                    <div className="relative">
                                        <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">
                                            Service Type
                                        </span>
                                        <div onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                                            className="px-3 py-2 border-2 border-gray-400 rounded-md w-[300px] text-gray-700 cursor-pointer bg-white hover:border-green-500 transition flex items-center justify-between">
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
                                                    <div key={service._id}
                                                        onClick={() => {
                                                            setSearch(service.name);
                                                            setStartDate(null);
                                                            setEndDate(null);
                                                            setShowServiceDropdown(false);
                                                        }}

                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                        {service.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
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
                                <div className="relative flex items-center gap-2 z-50">
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

                            <button
                                onClick={handleSearch}
                                className="px-5 py-2 bg-green-600 text-white rounded-sm cursor-pointer hover:bg-green-700 focus:ring-2 focus:ring-green-400 flex justify-center items-center gap-1 ease-in-out duration-300"
                            >
                                <Search className="w-4 h-4" />
                                Search
                            </button>   
                        </div>    
                        <div ref={printRef} className="bg-white rounded-sm shadow-sm border border-gray-200 max-h-[500px] overflow-y-auto">
                            <h1 className="print-title hidden">Customer Bookings</h1>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr className='whitespace-nowrap'>
                                        <th className="px-4 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Booking ID
                                        </th>
                                        <th className="px-4 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Customer Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Service Type
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Service Date
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Time
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Technician
                                        </th>
                                        <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Remarks
                                        </th>
                                        <th className="px-4 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Reason
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="9" className="text-center py-16">
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
                                            <td colSpan="9" className="text-center py-16">
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
                                            <tr
                                                key={booking._id}
                                                className={`hover:bg-gray-100 ease-in-out duration-300 cursor-pointer ${
                                                    selectedBooking?._id === booking._id ? "!bg-green-100" : ""
                                                }`}
                                                onClick={() => {
                                                    // Only allow selection if booking has no technician and is pending
                                                    if (!booking.technicianId && booking.status === "pending") {
                                                    setSelectedBooking(booking);
                                                    }
                                                }}
                                                onDoubleClick={() => {
                                                    setSelectedBooking(booking);
                                                    setShowDetailsModal(true);
                                                }}
                                                >

                                                <td className="px-4 py-4 text-sm text-gray-800 font-mono font-medium">
                                                    BOOK{booking._id.slice(-4).toUpperCase()}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    {booking.customerId?.fullname}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    {booking.serviceType?.name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {formatCurrency(booking.price)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(booking.date)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {booking.time}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                                                    {booking.technicianId ? (
                                                        <span className="font-semibold text-gray-800">
                                                            {booking.technicianId.fullname}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic">
                                                            No technician
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-8 pr-2">
                                                    <span className={`capitalize ${getStatusBadge(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-8 text-sm italic text-gray-600">
                                                    {booking.status === "cancelled" || booking.status === "declined" ? (
                                                        booking.cancelReason || "No reason provided"
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="p-6 mt-10 print:block hidden">
                                {isManager && (
                                    <div>
                                        <p className="text-sm text-gray-700">Prepared by: {isManager.fullname}</p>
                                        <span>Manager</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <div className='flex-1 flex justify-center'>
                                 <button
                                    className={`px-4 py-2 rounded text-white font-medium
                                    ${
                                        selectedBooking && !selectedBooking.technicianId && selectedBooking.status === "pending"
                                        ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                                        : "bg-gray-300 cursor-not-allowed"
                                    }`}
                                    disabled={!(selectedBooking && !selectedBooking.technicianId && selectedBooking.status === "pending")}
                                    onClick={() => {
                                    setSelectedBookingId(selectedBooking._id);
                                    setSelectedTechnicianId(selectedBooking.technicianId?._id || null);
                                    setShowTechModal(true);
                                    }}
                                >
                                    Assign Technician
                                </button>
                            </div>
                            <button onClick={() => handlePrint(printRef, {
                                    title: 'List of Customers',
                                    customDate: new Date().toLocaleDateString('en-US', { 
                                        year: 'numeric', month: 'long', day: 'numeric' 
                                    })
                                })}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm cursor-pointer hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md">
                                <Printer className="w-4 h-4 group-disabled:opacity-50" />
                                Print
                            </button>  
                        </div>
                    </div>    
                </div>
            </div>
            
            {showTechModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden animate-fade-in">
                        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-gray-50 tracking-tight">
                                    Available Technicians
                                </h3>
                            </div>
                        </div>

                        <div className="px-8 pt-6 pb-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                            <div className="space-y-2">
                                {technicians.map((tech) => (
                                    <label
                                        key={tech._id}
                                        className="grid grid-cols-[auto_1fr] gap-x-4 py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded cursor-pointer transition">
                                        <input
                                            type="checkbox"
                                            checked={selectedTechnicianId === tech._id}
                                            onChange={() =>
                                                setSelectedTechnicianId(
                                                    selectedTechnicianId === tech._id ? null : tech._id
                                                )
                                            }
                                            className="mt-0.5"
                                        />
                                        <span className="text-sm text-gray-900">{tech.fullname}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 px-4 py-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowTechModal(false);
                                    setSelectedBooking(null)
                                }}
                                className="px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 cursor-pointer text-sm ease-in-out duration-300">
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (!selectedTechnicianId) return;
                                    handleAssignTechnician(selectedBookingId, selectedTechnicianId);
                                    setShowTechModal(false)
                                }}
                                disabled={!selectedTechnicianId}
                                className="px-6 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed ease-in-out duration-300 text-sm cursor-pointer"
                            >
                                Confirm
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {showTechUnavailableModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded shadow w-full max-w-md animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Technician Unavailable</h2>
                        <p className="text-gray-600 mb-6">
                            Sorry, <span className="font-semibold">{unavailableTechName}</span> is currently busy with another booking.
                        </p>
                        <div className="flex justify-end">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-sm cursor-pointer"
                                onClick={() => {
                                    setShowTechUnavailableModal(false)
                                    setShowTechModal(true)
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-5xl animate-fade-in flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Booking Details</h3>
                                    <p className="text-sm text-gray-100">Complete service information</p>
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

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Customer ID</label>
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <p className="font-semibold text-gray-900 font-mono">
                                                CUST{selectedBooking.customerId._id.slice(-4).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Booking ID</label>
                                        <div className="flex items-center space-x-2">
                                            <Fingerprint  className="w-4 h-4 text-gray-500" />
                                            <p className="font-semibold text-gray-900 font-mono">
                                                BOOK{selectedBooking._id.slice(-4).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Customer Name</label>
                                        <div className="flex items-center space-x-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">
                                                {selectedBooking.customerId?.fullname}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Contact Number</label>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">
                                                {selectedBooking.customerId?.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Address</label>
                                        <div className="flex items-start space-x-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">
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
                                            <p className="font-medium text-gray-900">{selectedBooking.serviceType?.name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Amount</label>
                                        <p className="font-bold text-green-600">
                                            {formatCurrency(selectedBooking.price)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Booking Date</label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">{shortFormatDate(selectedBooking.createdAt)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Date</label>
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">{shortFormatDate(selectedBooking.date)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Service Time</label>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">{selectedBooking.time}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">{selectedBooking.duration} hours</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Assigned Technician</label>
                                        <div className="flex items-center space-x-2">
                                            <Wrench className="w-4 h-4 text-gray-500" />
                                            <p className="font-medium text-gray-900">
                                            {selectedBooking.technicianId?.fullname || 'Not assigned yet'}
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
                            {selectedBooking.status === 'declined' && selectedBooking.cancelReason && (
                                <div className="mt-4">
                                    <div className="flex items-center mb-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">
                                                Declined Reason
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
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Complete booking information and service details</span>
                                <div className='flex gap-2'>
                                    <button
                                        type="button"
                                        onClick={() => setShowDetailsModal(false)}
                                        className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ManagerBooking