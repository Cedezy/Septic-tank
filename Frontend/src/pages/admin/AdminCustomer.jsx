import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { formatCurrency } from '../../utils/FormatCurrency';
import { Search, UserX, CalendarDays, Printer, Users } from 'lucide-react';
import { useRef } from 'react';
import { handlePrint } from '../../utils/PrintUtils';
import { getStatusBadge } from '../../utils/BookingStats';
import logo from '../../assets/logo.png'
import SkeletonTable from '../../components/SkeletonTable';

const AdminCustomer = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState("all");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showProofImagesModal, setShowProofImagesModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [admin, setAdmin] = useState([]);
    const [loading, setLoading] = useState(true);
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

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/customer`, { 
                withCredentials: true 
            });
            setCustomers(response.data.customers);
            setFilteredCustomers(response.data.customers); 
        } 
        catch(err){
            console.error(err);
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    useEffect(() => {
        const fetchBookingHistory = async () => {
            if(!selectedUser) return;

            try{
                const res = await axios.get(`/book/history/${selectedUser._id}`, {
                    withCredentials: true
                });
                setBookingHistory(res.data.bookings || []);
            } 
            catch(err){
                console.error(err);
            }
        };

        if(showHistory){
            fetchBookingHistory();
        }

    }, [showHistory, selectedUser]);

    const handleRowClick = (booking) => {
        setSelectedBooking(booking);
        setShowProofImagesModal(true);
        setShowModal(false);
    };


    const handleSearch = () => {
        let results = [...customers];
        const lowerSearch = search.toLowerCase().trim();

        if (filterType === "name") {
            results = results.filter((c) => {
                const custId = `cust${c._id.slice(-6)}`;
                return (
                    c.fullname?.toLowerCase().includes(lowerSearch) ||
                    c.email?.toLowerCase().includes(lowerSearch) ||
                    custId.includes(lowerSearch)
                );
            });
        } 
        else if (filterType === "address") {
            results = results.filter((c) => {
                const addressString = `${c.address?.street || ""} ${c.address?.barangay || ""} ${c.address?.city || ""} ${c.address?.province || ""}`.toLowerCase();
                return addressString.includes(lowerSearch);
            });
        } 
        else if (filterType === "all") {
            results = results.filter((c) => {
                const custId = `cust${c._id.slice(-6)}`;
                const addressString = `${c.address?.street || ""} ${c.address?.barangay || ""} ${c.address?.city || ""} ${c.address?.province || ""}`.toLowerCase();
                return (
                    c.fullname?.toLowerCase().includes(lowerSearch) ||
                    c.email?.toLowerCase().includes(lowerSearch) ||
                    addressString.includes(lowerSearch) ||
                    custId.includes(lowerSearch)
                );
            });
        }

        // ✅ Automatically reset to show all if search is cleared
        if (lowerSearch === "") {
            results = [...customers];
        }

        setFilteredCustomers(results);
    };


    useEffect(() => {
        setSearch("");
        setFilteredCustomers(customers);
    }, [filterType, customers]);

    return (
        <div className="h-screen overflow-hidden flex">
            <div className='w-full'>
                <HeaderAdmin />
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='px-6 pb-4 flex flex-col gap-5 h-screen pt-40'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter font-medium uppercase text-gray-700'>
                                List of Customers
                            </span>
                        </div>
                        <div className="flex flex-col justify-center md:flex-row gap-2 items-center">
                            <div className="relative flex items-center gap-2">
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Search by</span>

                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer">
                                    <option value="all">All</option>
                                    <option value="name">Customer Name</option>
                                    <option value="address">Address</option>
                                </select>
                            </div>
                            <div className="relative flex items-center gap-2">
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </span>

                                    <input
                                        type="text"
                                        placeholder={
                                            filterType === "name"
                                                ? "Search by customer name"
                                                : filterType === "address"
                                                ? "Search by address (street, barangay, city)"
                                                : "Search"
                                        }
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="px-8 py-2 border-2 border-gray-400 rounded-md w-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <button
                                    onClick={handleSearch}
                                    className="px-5 py-2 bg-green-600 text-white rounded-sm cursor-pointer hover:bg-green-700 focus:ring-2 focus:ring-green-400 flex items-center gap-1 ease-in-out duration-300"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            </div>
                        </div>

                        <div ref={printRef} className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-y-auto">
                            <h1 className="print-title hidden">List of Customers</h1>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-6 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Customer ID
                                        </th>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Email Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Contact number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Address
                                        </th>
                                    </tr>
                                </thead>
                                {loading ? (
                                    <SkeletonTable rows={8} columns={7} />
                                ) : (
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {customers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-16">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <UserX className="w-8 h-8 text-gray-400" />                             
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No customers yet!</h3>
                                                        <p className="text-gray-500">Customers will appear here once they submit a request.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredCustomers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-16">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <UserX className="w-8 h-8 text-gray-400" />                             
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-700 mb-2">No records found!</h3>
                                                        <p className="text-gray-500">Try adjusting your search keywords.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCustomers.map(customer => (
                                                <tr key={customer._id}
                                                    onDoubleClick={() => {                         
                                                        setSelectedUser(customer);
                                                        setShowModal(true);
                                                    }}
                                                    className={`cursor-pointer transition ${selectedUser?._id === customer._id ? 'bg-green-100' : 'hover:bg-gray-100 ease-in-out duration-300'
                                                }`}>
                                                    <td className="px-4 py-4 text-sm text-gray-800 font-mono font-medium">
                                                        CUST{customer._id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-6 whitespace-nowrap text-sm text-gray-800">
                                                        {customer.fullname}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {customer.email}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">
                                                        {customer.phone}    
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-800">
                                                        {customer.address?.street},  {customer.address?.barangay}, {customer.address?.city} {customer.address?.province}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                )}
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
                        <div className="flex justify-end">        
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

                {showModal && selectedUser && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden animate-fade-in">
                            <div className="bg-gradient-to-r from-green-600 to-green-500 px-6 py-5 flex items-center gap-3 sticky top-0 z-10 shadow-md">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white tracking-tight">
                                        {selectedUser.fullname}
                                    </h3>
                                    <p className="text-green-50 text-sm mt-0.5">Customer Details</p>
                                </div>
                            </div>

                            {/* Content - Scrollable */}
                            <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                                <div className="p-8">
                                    <div className="grid grid-cols-2 gap-x-12 gap-y-1">
                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Customer ID</span>
                                            <span className="text-sm text-gray-900 font-medium font-mono">
                                                CUST{selectedUser._id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Email Address</span>
                                            <span className="text-sm text-gray-900">{selectedUser.email}</span>
                                        </div>

                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Contact Number</span>
                                            <span className="text-sm text-gray-900 font-medium">{selectedUser.phone}</span>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Birthdate</span>
                                            <span className="text-sm text-gray-900 font-medium">{formatDate(selectedUser.birthdate)}</span>
                                        </div>
                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Sex</span>
                                            <span className="text-sm text-gray-900 font-medium capitalize">{selectedUser.phone || 'not set'}</span>
                                        </div>

                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Total Bookings</span>
                                            <span className="text-sm text-gray-900 font-medium">
                                                {selectedUser.totalBookings || 0}{" "}
                                                {selectedUser.totalBookings !== 1 ? "Bookings" : "Booking"}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-[140px_1fr] py-3.5 border-b border-gray-200">
                                            <span className="text-sm font-medium text-gray-600">Address</span>
                                            <span className="text-sm text-gray-900">
                                                {selectedUser.address?.street} {selectedUser.address?.barangay},{" "}
                                                {selectedUser.address?.city}, {selectedUser.address?.province}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {showHistory && (
                                    <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white px-4 py-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                            Transaction History
                                        </h3>

                                        {bookingHistory.length === 0 ? (
                                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <CalendarDays className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    No booking records found for {selectedUser.fullname}.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto rounded-sm border border-gray-200 shadow-sm">
                                                <table className="min-w-full divide-y divide-gray-200 bg-white">
                                                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                        <tr className='whitespace-nowrap'>
                                                            <th className="px-5 py-6 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Booking ID
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Booked Date
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Service Type
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Amount
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Technician
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                                                OFFICIAL RECIEPT
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Reason
                                                            </th>
                                                            <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-200">
                                                        {bookingHistory.map((b) => (
                                                            <tr key={b._id}>
                                                                <td className="px-6 py-6 text-sm text-gray-800 font-mono font-medium">
                                                                    BOOK{b._id.slice(-4).toUpperCase()}
                                                                </td>
                                                                <td className="px-4 py-4 text-sm text-gray-800">
                                                                    {shortFormatDate(b.createdAt)}
                                                                </td>
                                                                <td className="px-4 py-4 text-sm text-gray-800">
                                                                    {b.serviceType?.name || "N/A"}
                                                                </td>
                                                                <td className="px-4 py-4 text-sm text-gray-800 font-semibold whitespace-nowrap">
                                                                    {formatCurrency(b.price)}
                                                                </td>
                                                                <td className={`px-4 py-4 text-sm ${
                                                                    b.technicianId ? 'text-gray-800' : 'text-gray-400 italic'
                                                                    }`}
                                                                    >
                                                                    {b.technicianId?.fullname || 'No technician assigned'}
                                                                </td>
                                                                <td className="px-4 sm:px-6 py-4 text-sm text-center">
                                                                    {b.status === "completed" ? (
                                                                        <span
                                                                            className="px-4 sm:px-6 py-4 text-sm text-blue-600 font-semibold underline cursor-pointer"
                                                                                onClick={() => handleRowClick(b)}
                                                                            >
                                                                            OR
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400">—</span>  // or leave blank
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-8 text-sm italic text-gray-600">
                                                                    {b.status === "cancelled" || b.status === "declined" ? (
                                                                        b.cancelReason || "No reason provided"
                                                                    ) : (
                                                                        <span className="text-gray-400">—</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm">
                                                                    <span className={`${getStatusBadge(b.status)} capitalize`}>
                                                                        {b.status}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center sticky bottom-0 bg-white shadow-lg">
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 active:bg-green-800 ease-in-out duration-300 flex items-center gap-2 text-sm font-medium shadow-sm hover:shadow cursor-pointer">
                                    {showHistory ? "Hide Transaction History" : "View Transaction History"}
                                </button>

                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setSelectedUser(null);
                                        setShowHistory(false);
                                    }}
                                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-md hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 text-sm font-medium cursor-pointer">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showProofImagesModal && selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <div id="printable-receipt" className="bg-white shadow-2xl rounded-sm w-full max-w-3xl animate-fade-in flex flex-col max-h-[90vh] overflow-hidden">
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
                                        <h2 className='font-bold text-2xl text-gray-800'>RMG SEPTIC TANK CLEANING SERVICES</h2>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-700">OFFICIAL RECEIPT</h2>
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
                                                <span className="text-sm text-gray-600">Service Date:</span>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {selectedBooking.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount Section */}
                                <div className=" bg-gray-50 -mx-8 px-8 py-4">
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
                                                {selectedBooking.proofImages.map((img, index) => (
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
                                            setSelectedUser(null)
                                            setShowProofImagesModal(false)
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
        </div>
    );
};

export default AdminCustomer;
