import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/FormatDate';
import { CalendarDays, Plus, X, Calendar, Clock, AlertCircle, Trash } from 'lucide-react';

const AdminDates = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [blockedDates, setBlockedDates] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(null);

    const fetchBlockedDates = async () => {
        try{
            const response = await axios.get('/date', {
                withCredentials: true
            });
            setBlockedDates(response.data);
        } 
        catch(err){
            console.error(err);
        }
    };

    const handleBlockDate = async () => {
        if(!date) return alert('Please select a date');

        setLoading(true);
        try{
            const response = await axios.post('/date', { date, reason }, {
                withCredentials: true
            });
            setDate('');
            setReason('');
            setIsModalOpen(false);
            fetchBlockedDates();
            toast.success(response.data.message);
        } 
        catch(err){
            toast.error(err.response?.data?.message);
        } 
        finally{
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm('Are you sure you want to remove this blocked date?')) return;

        setDeleting(id);
        try{
            const response = await axios.delete(`/date/${id}`, {
                withCredentials: true
            });
            toast.success(response.data.message);
            fetchBlockedDates();
        } 
        catch(err){
            console.log(err);
        } 
        finally{
            setDeleting(null);
        }
    };

    useEffect(() => {
        fetchBlockedDates();
    }, []);

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-green-50/20 to-gray-100">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'} `}>
                    <div className='p-4 flex flex-col gap-4'>
                        <div className='flex justify-between'>
                            <div className='flex justify-center items-center gap-2 italic font-semibold uppercase text-gray-700'>
                                <CalendarDays/>
                                <span className='text-xl'>Manage Blocked Dates</span>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="py-2 px-6 bg-green-500 hover:bg-green-600 rounded-sm text-white font-medium ease-in-out duration-200 flex items-center gap-2 cursor-pointer">
                                <Plus className="w-5 h-5" />
                                <span>Block Date</span>
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                                    Blocked Dates
                                </h3>
                                {blockedDates.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CalendarDays className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-lg font-medium">No blocked dates found</p>
                                        <p className="text-gray-400 text-sm mt-2">Click "Block Date" to add your first blocked date</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        {blockedDates.map((item) => (
                                            <div key={item._id} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-2">
                                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                            <span className="font-semibold text-gray-800 text-lg">
                                                                {formatDate(item.date)}
                                                            </span>
                                                        </div>
                                                        {item.reason && (
                                                            <div className="ml-6">
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                                    {item.reason}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        disabled={deleting === item._id}
                                                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 cursor-pointer">
                                                        {deleting === item._id ? (
                                                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                        ) : (
                                                            <Trash className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                        
                            </div>
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-fade-in overflow-hidden">
                                <div className="bg-green-500 px-6 py-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-white">Block New Date</h3>
                                        <button
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setDate('');
                                                setReason('');
                                            }}
                                            className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                                            <X className="w-5 h-5 text-white" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Select Date *
                                            </label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split("T")[0]}
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                Reason (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                                placeholder="e.g., Holiday, Maintenance, Personal"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-8">
                                        <button
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                setDate('');
                                                setReason('');
                                            }}
                                            className="px-10 py-3 text-gray-600 hover:text-gray-800 font-semibold rounded-sm border-2 border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleBlockDate}
                                            disabled={loading}
                                            className="px-6 py-3 bg-green-500 hover:bg-green-600 ease-in-out duration-300 text-white rounded-sm flex justify-center items-center gap-2 cursor-pointer">
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Blocking...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CalendarDays className="w-5 h-5" />
                                                    <span>Block Date</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDates;