import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { formatDate } from '../../utils/FormatDate';
import { getStatusBadge } from '../../utils/BookingStats';
import { Search, ClipboardList, FileWarning, CalendarDays, Printer } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRef } from 'react';
import { handlePrint } from '../../utils/PrintUtils';

const AdminSchedule = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedTab, setSelectedTab] = useState('all');
    const [selectedDate, setSelectedDate] = useState(null);
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
        try{
            const response = await axios.get('/book', { 
                withCredentials: true
            });
            setBookings(response.data.bookings);
        } 
        catch(err){
            console.error(err);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const filteredByTab = bookings.filter(booking => {
        if(booking.status === 'pending') return false;
        return selectedTab === 'all' || booking.status === selectedTab;
    });

    const filteredBySearch = filteredByTab.filter(booking => {
        const searchText = search.toLowerCase();
        const customerName = booking.customerId?.fullname?.toLowerCase() || '';
        const serviceName = booking.serviceType?.name?.toLowerCase() || '';
        const technicianName = booking.technicianId?.fullname?.toLowerCase() || '';
        return (
            customerName.includes(searchText) ||
            serviceName.includes(searchText) ||
            technicianName.includes(searchText)
        );
    });

    const filteredByDate = selectedDate
  ? filteredBySearch.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return (
        bookingDate.toDateString() === selectedDate.toDateString()
      );
    })
  : filteredBySearch;

const sortedBookings = filteredByDate.sort((a, b) => new Date(a.date) - new Date(b.date));


    return (
        <div className="min-h-screen flex">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='flex flex-col gap-5 p-6'>
                        <div className='flex flex-col gap-4'>
                            <div className='flex justify-center items-center gap-2'>
                                <div className='p-2 rounded-full shadow-2xl bg-green-500'>
                                    <ClipboardList className='w-5 h-5 text-gray-50'/>
                                </div>
                                <span className='text-2xl tracking-tighter font-medium uppercase text-gray-700'>
                                    List of Service Schedules
                                </span>
                            </div>
                            <div className='flex justify-between flex-wrap-reverse'>
                                <div className="flex gap-2 items-center justify-end">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="w-5 h-5 text-gray-400" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>  
                                    <div>
                                        <select value={selectedTab}
                                            onChange={(e) => setSelectedTab(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-md text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                                            <option value="all">All Status</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="in-progress">In-progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div className="relative flex items-center">
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={(date) => setSelectedDate(date)}
                                            placeholderText="Filter by date"
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            dateFormat="MMMM d, yyyy"
                                        />
                                        <CalendarDays className="absolute right-2 top-2 w-5 h-5 text-gray-500 pointer-events-none" />
                                        {selectedDate && (
                                            <button
                                                onClick={() => setSelectedDate(null)}
                                                className="ml-2 px-3 pr-8 cursor-pointer py-2 bg-gray-100 border border-gray-300 rounded-sm text-gray-600 hover:bg-gray-200 ease-in-out duration-300"
                                            >
                                                Clear Date
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div ref={printRef} className="bg-white rounded-sm shadow-sm border border-gray-200">
                            <h1 className="print-title hidden">Schedules</h1>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Customer Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Service Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Assigned Technician
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Service Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Service Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredByTab.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <FileWarning className="w-8 h-8 text-gray-400" />
                                                    </div>      
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings schedule yet</h3>
                                                <p className="text-gray-500">Confirmed bookings will appear here once confirmed.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : sortedBookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <FileWarning className="w-8 h-8 text-gray-400" />
                                                    </div> 
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">No records found!</h3>
                                                <p className="text-gray-500">Try adjusting your search keywords.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedBookings.map(booking => (
                                            <tr key={booking._id} className="hover:bg-gray-100 ease-in-out duration-300">
                                                <td className="px-6 py-6 text-sm text-gray-900">{booking.customerId?.fullname}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{booking.serviceType?.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{booking.technicianId?.fullname || '- Unassigned -'}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{formatDate(booking.date)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{booking.time}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <span className={getStatusBadge(booking.status)}>
                                                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                    </span>
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
                            <button
                                onClick={() => handlePrint(printRef, {
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
        </div>
    );
};

export default AdminSchedule;
