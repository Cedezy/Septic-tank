import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios'; 
import HeaderAdmin from '../../components/HeaderAdmin';
import SidebarAdmin from '../../components/SidebarAdmin';
import { toast } from 'react-toastify';
import { Search, Mail, CalendarDays, AlertTriangle  } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminMessage = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); 
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);

    const fetchMessages = async () => {
        try{
            const response = await axios.get('/message', { withCredentials: true });
            setMessages(response.data.messages);
            setFilteredMessages(response.data.messages);
        } catch(err){ console.error(err); }
    };

    useEffect(() => { fetchMessages(); }, []);

    useEffect(() => {
        let filtered = messages.filter(msg => {
            const matchesSearch =
                msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                msg.message.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'read' && msg.status === 'Read') ||
                (filterStatus === 'unread' && msg.status !== 'Read');

            const matchesDate = selectedDate
                ? new Date(msg.createdAt).toDateString() === selectedDate.toDateString()
                : true;

            return matchesSearch && matchesStatus && matchesDate;
        });
        setFilteredMessages(filtered);
    }, [messages, searchTerm, filterStatus, selectedDate]);

    const handleConfirmAction = async () => {
        if (!confirmAction) return;

        const { action, message } = confirmAction;

        try {
            let response;

            switch (action) {
            case 'markAsRead':
                response = await axios.put(`/message/${message._id}/read`, {}, { withCredentials: true });
                toast.success(response.data.message);
                break;
            case 'markAsUnread':
                response = await axios.put(`/message/${message._id}/unread`, {}, { withCredentials: true });
                toast.success(response.data.message);
                break;
            case 'delete':
                await axios.delete(`/message/${message._id}`, { withCredentials: true });
                toast.success("Message deleted");
                break;
            }
            setSelectedMessage(null);
            fetchMessages();
        } catch (err) {
            console.error(err);
        }

        setShowConfirmModal(false);
        setConfirmAction(null);
    };


    const getConfirmationMessage = () => {
        if (!confirmAction) return '';
        if (confirmAction.action === 'delete') return 'Are you sure you want to delete this message?';
        if (confirmAction.action === 'markAsRead') return 'Mark this message as read?';
        if (confirmAction.action === 'markAsUnread') return 'Mark this message as unread?';
        return '';
    };


    return (
        <div className="min-h-screen flex">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="p-6 flex flex-col gap-5">
                        <div className='flex justify-center items-center gap-2'>
                            <div className='p-2 rounded-full shadow-2xl bg-green-500'>
                                <Mail className='w-5 h-5 text-gray-50'/>
                            </div>
                            <span className='text-2xl tracking-tighter font-medium uppercase text-gray-700'>
                                Manage MESSAGES
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search messages"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="px-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 text-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                            </select>

                            <div className="relative flex items-center">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    placeholderText="Filter by date"
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    dateFormat="MMMM d, yyyy"
                                    maxDate={new Date()}
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

                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredMessages.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <Mail className="w-8 h-8 text-gray-400" />                             
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-700 mb-2">No message found!</h3>
                                                    <p className="text-gray-500">Try adjusting your search keywords.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMessages.map(msg => (
                                            <tr
                                                key={msg._id}
                                                onClick={() => setSelectedMessage(msg)}
                                                className={`cursor-pointer transition ${
                                                    selectedMessage?._id === msg._id ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">{msg.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">{msg.email}</td>
                                                <td className="px-6 py-4 text-sm text-gray-900 italic">{msg.message}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        msg.status === 'Read' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>{msg.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {msg.createdAt && new Date(msg.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                                
                        <div className="flex justify-end gap-2 py-4 bg-white border-t border-gray-200">
                            <button
                                disabled={!selectedMessage}
                                onClick={() => {
                                    if (selectedMessage) {
                                    setConfirmAction({
                                        action: selectedMessage.status === 'Read' ? 'markAsUnread' : 'markAsRead',
                                        message: selectedMessage
                                    });
                                    setShowConfirmModal(true);
                                    }
                                }}
                                className={`py-3 px-4 rounded-sm font-medium transition cursor-pointer text-sm ${
                                    !selectedMessage
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                                >
                                {selectedMessage?.status === 'Read' ? 'Mark as Unread' : 'Mark as Read'}
                            </button>
                            <button
                                disabled={!selectedMessage}
                                onClick={() => selectedMessage && setConfirmAction({ action: 'delete', message: selectedMessage }) || setShowConfirmModal(true)}
                                className={`py-3 px-4 rounded-sm font-medium transition cursor-pointer text-sm ${
                                    !selectedMessage ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full animate-fade-in max-w-md mx-4">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                        </div>
                        <p className="text-gray-600 mb-6">{getConfirmationMessage()}</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 ease-in-out duration-300 rounded-sm font-medium cursor-pointer">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className="px-6 py-2 rounded-sm font-medium bg-green-500 text-white hover:bg-green-600 cursor-pointer">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMessage;
