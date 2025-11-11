import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../../lib/axios'
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { formatCurrency } from '../../utils/FormatCurrency';
import { getStatusBadge } from '../../utils/BookingStats';
import { Search } from 'lucide-react';
import { FileWarning } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AlertCircle, Image } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  FileText,
  User,
  Phone,
  MapPin,
  Building2,
  Clock,
  Package,
  Wrench,
  Calendar,
  StickyNote,
  HelpCircle,
  Printer 
} from "lucide-react";
import { useRef } from 'react';
import { handlePrint } from '../../utils/PrintUtils';

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const AdminBooking = () => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState("all");
    const [hasSelected, setHasSelected] = useState(false);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [showRemarksDropdown, setShowRemarksDropdown] = useState(false);
    const [showTechDropdown, setShowTechDropdown] = useState(false);
    const [admin, setAdmin] = useState([]);
    const printRef = useRef();

    useEffect(() => {
        const fetchAdminData = async () => {
            try{
                const response = await axios.get('user/me', {
                    withCredentials: true
                });
                setAdmin(response.data.user)
            }
            catch(err){
                console.log(err);
            }
        }
        fetchAdminData();
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
        setFilteredBookings(bookings);
    }, [filterType, bookings]);


    return (
        <div className="h-screen flex overflow-hidden">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='flex flex-col gap-4 p-6'>
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
                                        setHasSelected(true); // 👈 triggers field visibility
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

                            {hasSelected && filterType === "all" && (
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

                            {hasSelected &&
                                (filterType === "all" ||
                                filterType === "name" ||
                                filterType === "remarks" ||
                                filterType === "serviceType" ||
                                filterType === "technician" ||
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
                        <div ref={printRef} className="bg-white rounded-sm shadow-sm border border-gray-200 max-h-[500px] overflow-y-auto">
                            <h1 className="print-title hidden">Customer Bookings</h1>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
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
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Technician
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Remarks
                                        </th>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                                            Reason
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-16">
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
                                                    setShowDetailsModal(true);
                                                }}>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    {booking.customerId?.fullname}
                                                </td>
                                                <td className="px-4 py-6 text-sm text-gray-900">
                                                    {booking.serviceType?.name}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {formatCurrency(booking.price)}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDate(booking.date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {booking.time}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {booking.technicianId?.fullname ? (
                                                        <div className="text-sm text-gray-800">
                                                            {booking.technicianId.fullname}
                                                        </div>
                                                    ) : (
                                                        <span className='text-sm italic text-gray-600'>
                                                            No technician
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-8">
                                                    <span className={`capitalize ${getStatusBadge(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-8 text-sm italic text-gray-600">
                                                    {booking.status === "cancelled" || booking.status === "declined" ? (
                                                        booking.cancelReason || "No reason provided"
                                                    ) : (
                                                        "Not applicable"
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <div className="p-6 mt-10 print:block hidden">
                                {admin && (
                                    <div>
                                        <p className="text-sm text-gray-700">Prepared by: {admin.fullname}</p>
                                        <p>Administrator</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end py-4 bg-white border-t border-gray-200">        
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

            {showDetailsModal && selectedBooking && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-4xl animate-fade-in flex flex-col max-h-[90vh] overflow-hidden">
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
                                            <p className="text-sm font-medium text-gray-900">{selectedBooking.duration} hours</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 mb-1 block">Assigned Technician</label>
                                        <div className="flex items-center space-x-2">
                                            <Wrench className="w-4 h-4 text-gray-500" />
                                            <p className="text-sm font-medium text-gray-900">
                                            {selectedBooking.technicianId?.fullname || 'Not assigned yet'}
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

export default AdminBooking