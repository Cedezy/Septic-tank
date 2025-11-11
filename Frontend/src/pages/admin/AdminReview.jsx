import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/FormatDate';
import { Star, Calendar, ClipboardList, AlertTriangle, Search, MessageSquare  } from 'lucide-react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const AdminReview = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);

    const fetchReviews = async () => {
        try{
            const response = await axios.get('/review');
            setReviews(response.data.reviews);
            setFilteredReviews(response.data.reviews);
        } 
        catch(err){
            console.log(err);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);


    const handleConfirmAction = async () => {
        const { action, review } = confirmAction;

        try{
            if(action === 'approve'){
                await updateStatus(review._id, 'approved');
            } 
            else if(action === 'reject'){
                await updateStatus(review._id, 'rejected');
            }
            setSelectedReview(null);
        } 
        catch(error){
            console.error('Action failed:', error);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    const updateStatus = async (id, status) => {
        try{
            const response = await axios.put(`/review/${id}/update`, { status }, { 
                withCredentials: true
            });
            toast.success(response.data.message);
            fetchReviews();
        } 
        catch(err){
            console.log(err);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
            />
        ));
    };

    const getStatusBadge = (review) => {
        switch (review.status) {
            case 'approved':
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                        Approved
                    </span>
                );
            case 'rejected':
                return (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                        Rejected
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                        Pending
                    </span>
                );
        }
    };

    const getConfirmationMessage = () => {
        if (!confirmAction) return '';

        const { action } = confirmAction;
        switch (action) {
            case 'approve':
                return 'Are you sure you want to approve this review?';
            case 'reject':
                return 'Are you sure you want to reject this review?';
            default:
                return '';
        }
    };

    const handleSearch = () => {
        let filtered = reviews;

        if(filterType !== "all" && search.trim() !== ""){
            const searchText = search.toLowerCase();

            if(filterType === "name"){
                filtered = filtered.filter((f) =>
                    f.customerId?.fullname.toLowerCase().includes(searchText)
                );
            } 
        }

        if(filterType === "status" && filterStatus !== "All" && filterStatus !== ""){
            filtered = filtered.filter((r) => r.status === filterStatus);
        }

        if(filterType === "rating" && ratingFilter !== "" && ratingFilter !== "All"){
            filtered = filtered.filter((r) => r.rating === Number(ratingFilter));
        }
        
        if(filterType === "date"){
            filtered = filtered.filter(f => {
                const bookingDate = new Date(f.createdAt); // Date object
                return (
                    (!startDate || bookingDate >= startDate) &&
                    (!endDate || bookingDate <= endDate)
                );
            });
        }

        const sorted = filtered.sort((a, b) => {
            if (a.status === "Pending" && b.status !== "Pending") return -1;
            if (a.status !== "Pending" && b.status === "Pending") return 1;
            return 0;
        });
        setFilteredReviews(sorted);
    };
  
    useEffect(() => {
        setFilteredReviews(reviews); 
    }, [reviews]);

    return (
        <div className="min-h-screen flex">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'} `}>
                    <div className="p-6 flex flex-col gap-4">
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter uppercase font-medium text-gray-700'>
                                Manage Customer Reviews
                            </span>
                        </div>
                        <div className="flex flex-col justify-center md:flex-row gap-3 items-center">
                            <div className="relative flex items-center gap-2">
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Search by</span>
                                <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer text-gray-700"
                                >
                                <option value="">All</option>
                                <option value="name">Customer Name</option>
                                <option value="status">Status</option>
                                <option value="rating">Ratings</option>
                                <option value="date">Date</option>
                                </select>
                            </div>

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
                                        className="px-8 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-sm"
                                    />
                                </div>
                            )}

                            {filterType === "status" && (
                                <div className="relative">
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Status</span>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer text-gray-700"
                                >
                                    <option value="">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                                </div>
                            )}

                            {filterType === "rating" && (
                                <div className="relative">
                                <span className="absolute -top-2 left-2 bg-white px-2 text-xs text-gray-600">Ratings</span>
                                <select
                                    value={ratingFilter}
                                    onChange={(e) => setRatingFilter(e.target.value)}
                                    className="px-3 py-2 border-2 border-gray-400 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer text-gray-700"
                                >
                                    <option value="">All Ratings</option>
                                    {[5, 4, 3, 2, 1].map((r) => (
                                    <option key={r} value={r}>
                                        {r} {Array(r).fill("★").join("")}
                                    </option>
                                    ))}
                                </select>
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
                                            maxDate={new Date()}
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
                                            maxDate={new Date()}
                                            placeholderText="To date"
                                            className="pl-10 pr-3 py-2 border-2 w-[200px] border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            dateFormat="MMMM d, yyyy"
                                        />
                                    </div>
                                </div>
                            )}

                            {(filterType === "name" || filterType === "status" || filterType === "rating" || filterType === "date") && (
                                <button
                                onClick={handleSearch}
                                className="px-5 py-2 bg-orange-400 text-white rounded-sm cursor-pointer hover:bg-orange-500 focus:ring-2 focus:ring-orange-400 flex justify-center items-center gap-1 ease-in-out duration-300"
                                >
                                <Search className="w-4 h-4" />
                                Search
                                </button>
                            )}
                        </div>


                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
                            <h1 className="print-title hidden">List of Reviews</h1>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">Customer Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReviews.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <MessageSquare className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews found!</h3>
                                                    <p className="text-gray-500">
                                                        {search || filterType !== 'all'
                                                            ? 'Try adjusting your search or filter'
                                                            : 'Reviews will appear here once customers submit them'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReviews.map(review => (
                                            <tr key={review._id}
                                            onClick={() => setSelectedReview(review)}
                                                className={`cursor-pointer transition ${
                                                selectedReview?._id === review._id ? 'bg-gray-100' : 'hover:bg-gray-50'
                                                }`}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {review?.customerId?.fullname || 'Anonymous Customer'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 italic">"{review.comment}"</td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    <div className="flex">{renderStars(review.rating)}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 space-x-1">
                                                    {getStatusBadge(review)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                    {formatDate(review.createdAt)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>            
                        <div className="flex justify-end gap-2 py-4 bg-white border-t border-gray-200">
                            <button
                                disabled={
                                    !selectedReview ||
                                    selectedReview.status === "approved" // disable if already approved
                                }
                                onClick={() => {
                                    setConfirmAction({ action: "approve", review: selectedReview });
                                    setShowConfirmModal(true);
                                }}
                                className={`py-2 px-4 rounded-sm font-medium text-sm cursor-pointer ${
                                    !selectedReview || selectedReview.status === "approved"
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                            >
                                Approve
                            </button>

                            <button
                                disabled={
                                    !selectedReview ||
                                    selectedReview.status === "rejected" 
                                }
                                onClick={() => {
                                    setConfirmAction({ action: "reject", review: selectedReview });
                                    setShowConfirmModal(true);
                                }}
                                className={`py-2 px-6 rounded-sm font-medium text-sm cursor-pointer ${
                                    !selectedReview || selectedReview.status === "rejected"
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-red-500 text-white hover:bg-red-600"
                                }`}
                            >
                                Reject
                            </button>
                        </div>    
                    </div>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full animate-fade-in max-w-md mx-4">
                        <div className="flex items-center mb-4">
                            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-900">Confirm Action</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            {getConfirmationMessage()}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 ease-in-out duration-300 rounded-sm font-medium cursor-pointer">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`px-6 py-2 rounded-sm font-medium ease-in-out duration-300 cursor-pointer ${
                                    confirmAction?.action === 'delete'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                }`}>
                                {confirmAction?.action === 'delete' ? 'Delete' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReview;