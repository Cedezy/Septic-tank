import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../api/axios';
import { Search, Printer, Calendar  } from 'lucide-react';
import { formatDate, shortFormatDate } from '../../utils/FormatDate';
import { UserX, Users} from 'lucide-react';
import { useRef } from 'react';
import { handlePrint } from '../../utils/PrintUtils';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminUser = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
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
    

    const fetchUsers = async () => {
        try{
            const response = await axios.get('/user/customer', {
                withCredentials: true
            });
            setUsers(response.data.users);
        } 
        catch(err){
            console.log(err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        setFilteredUsers(users); 
    }, [users]);

    const handleSearch = () => {
        const start = startDate ? new Date(startDate).setHours(0,0,0,0) : null;
        const end = endDate ? new Date(endDate).setHours(23,59,59,999) : null;

        const results = users
            .filter(user => user.role === 'customer')
            .filter(c => {
                const lowerSearch = search.toLowerCase();
                const userId = `user${c._id.slice(-6)}`;
                const createdAt = new Date(c.createdAt).getTime();

                const address = `${c.street || ""} ${c.barangay || ""} ${c.city || ""} ${c.province || ""}`.toLowerCase();

                if (filterType === "name") {
                    return (
                        c.fullname?.toLowerCase().includes(lowerSearch) ||
                        c.email?.toLowerCase().includes(lowerSearch) ||
                        address.includes(lowerSearch) ||
                        userId.includes(lowerSearch)
                    );
                }

                if (filterType === "date") {
                    return (
                        (!start || createdAt >= start) &&
                        (!end || createdAt <= end)
                    );
                }

                // For "all"
                return (
                    (
                        c.fullname?.toLowerCase().includes(lowerSearch) ||
                        c.email?.toLowerCase().includes(lowerSearch) ||
                        address.includes(lowerSearch) ||
                        userId.includes(lowerSearch)
                    ) &&
                    (!start || createdAt >= start) &&
                    (!end || createdAt <= end)
                );
            });

        setFilteredUsers(results);
    };

     useEffect(() => {
        setSearch("");
        setFilteredUsers(users);
    }, [filterType, users]);

    return (
        <div className='flex h-screen overflow-hidden'>
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='p-6 flex flex-col gap-5'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter font-medium uppercase text-gray-700'>
                                List of Registered Users
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
                                    <option value="name">Name</option>
                                    <option value="date">Date</option>
                                </select>
                            </div>
                            <div className="relative flex items-center gap-2 z-20">
                                {filterType !== "date" && (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="w-4 h-4 text-gray-400" />
                                        </span>
                                        <input
                                            type="text"
                                            placeholder={
                                                filterType === "name"
                                                    ? "Search by name"
                                                    : "Search"
                                            }
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                            className="px-8 py-2 border-2 border-gray-400 rounded-md w-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                )}
                                {filterType === "date" && (
                                    <div className="flex gap-3">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                <Calendar className="w-5 h-5" />
                                            </span>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={setStartDate}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                placeholderText="From date"
                                                className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                                maxDate={new Date()}
                                            />
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                                <Calendar className="w-5 h-5" />
                                            </span>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={setEndDate}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate}
                                                placeholderText="To date"
                                                className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                dateFormat="MMMM d, yyyy"
                                                maxDate={new Date()}
                                            />
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleSearch}
                                    className="px-5 py-2 bg-green-600 text-white rounded-sm cursor-pointer hover:bg-green-700 focus:ring-2 focus:ring-green-400 flex items-center gap-1 ease-in-out duration-300">
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            </div>
                        </div>
              
                        <div ref={printRef} className="bg-white rounded-sm shadow-sm border border-gray-200 max-h-[500px] overflow-y-auto">
                            <h1 className="print-title hidden">List of Registered User</h1>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-6 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            USER ID
                                        </th>
                                        <th className="px-4 py-6 text-left text-xs font-medium text-gray-500 uppercase">
                                            Full Name
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Email Address
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Contact number
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Birthdate
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                                            Registered Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Address
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white divide-y divide-gray-200'>
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <UserX className="w-8 h-8 text-gray-400" />                             
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No registered customers yet!</h3>
                                                    <p className="text-gray-500">Customers will appear here once they register.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <UserX className="w-8 h-8 text-gray-400" />                             
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No records found!</h3>
                                                    <p className="text-gray-500">Try adjusting your search keywords.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user, idx) => (
                                            <tr key={user._id} className={`cursor-pointer transition duration-150 ${selectedUser?._id === user._id ? 'bg-green-100' : 'hover:bg-gray-100 ease-in-out duration-300'}`}        
                                                onDoubleClick={() => {                         
                                                    setSelectedUser(user);
                                                    setIsModalOpen(true);
                                                }}>
                                                <td className="px-4 py-4 text-sm text-gray-800">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-6 text-sm text-gray-900">       
                                                    {user.fullname}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900">
                                                    {user.email}
                                                </td>
                                                <td className="px-4 py-4 text-sm capitalize">
                                                    {user.phone}
                                                </td>
                                                <td className="px-4 py-4 text-sm capitalize whitespace-nowrap">
                                                    {shortFormatDate(user.birthdate)}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 capitalize">
                                                    {shortFormatDate(user.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">    
                                                    {user.street} {user.barangay}, {user.city}      
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
                                        <span>Administrator</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handlePrint(printRef, {
                                        title: 'List of Registered Users',
                                        customDate: new Date().toLocaleDateString('en-US', { 
                                            year: 'numeric', month: 'long', day: 'numeric' 
                                        })
                                    })}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-sm cursor-pointer hover:bg-hray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print</span>
                                </button>
                            </div>
                        </div>
                        
                    </div>

                    {isModalOpen && selectedUser && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                            <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
                                <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-medium text-gray-50 tracking-tight">{selectedUser.fullname}</h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-8 pt-6 pb-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-500">Registration Date</span>
                                            <span className="col-span-2 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-500">Email Address</span>
                                            <span className="col-span-2 text-sm text-gray-900">{selectedUser.email}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-500">Contact Number</span>
                                            <span className="col-span-2 text-sm text-gray-900">{selectedUser.phone}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-500">Birth Date</span>
                                            <span className="col-span-2 text-sm text-gray-900">{formatDate(selectedUser.birthdate)}</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                                            <span className="text-sm font-medium text-gray-500">Sex</span>
                                            <span className="col-span-2 text-sm text-gray-900 capitalize">{selectedUser.gender || 'Male'}</span>
                                        </div>

                                        <div className="grid grid-cols-3 gap-x-4 py-3">
                                            <span className="text-sm font-medium text-gray-500">Complete Address</span>
                                            <span className="col-span-2 text-sm text-gray-900">
                                                {selectedUser.street} {selectedUser.barangay}, {selectedUser.city}, {selectedUser.province}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 px-4 py-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setSelectedUser(null);
                                        }}
                                         className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminUser;