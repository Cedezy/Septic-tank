import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { formatCurrency } from '../../utils/FormatCurrency';
import { FaTrash } from "react-icons/fa";
import { Package, Image, Search, Timer } from 'lucide-react';
import SkeletonCard from '../../components/SkeletonCard';

const AdminServices = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        duration: '',
        images: [],
        existingImages: [],
        removedImages: [],
        showOnHome: false, 
    });
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageService, setImageService] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try{
            setLoading(true)
            const response = await axios.get('/service');
            setServices(response.data.services); 
        } 
        catch(err){
            console.error(err);
        }finally {
            setLoading(false); // ← stop loading
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const dataToSend = new FormData();
        dataToSend.append("name", formData.name);
        dataToSend.append("description", formData.description);
        dataToSend.append("showOnHome", formData.showOnHome);
        dataToSend.append("price", formData.price);
        dataToSend.append("duration", formData.duration);

        if(formData.images && formData.images.length > 0){
            formData.images.forEach(img => {
            dataToSend.append("images", img);
            });
        }

        if(editingId && formData.removedImages.length > 0){
            dataToSend.append("removedImages", JSON.stringify(formData.removedImages));
        }

        try{
            let response;
            if(editingId){
                response = await axios.put(`/service/${editingId}`, dataToSend, {
                    withCredentials: true,
                });
            } 
            else{
                response = await axios.post("/service", dataToSend, {
                    withCredentials: true,
                });
            }
            toast.success(response.data.message);
            setShowForm(false);
            setEditingId(null);
            fetchServices();
            setSelectedService(null);
        } 
        catch(err){
            console.log(err);
        }
        finally {
            setLoading(false); // stop loading
        }
    };

    const handleEdit = (service) => {
        setShowForm(true);
        setFormData({
            name: service.name,
            description: service.description,
            price: service.price || '',
            duration: service.duration || '',
            images: [],
            existingImages: service.images || [],
            removedImages: [],
            showOnHome: service.showOnHome || false,
        });
        setEditingId(service._id);
    };

    return (
         <div className="h-screen flex overflow-hidden">
            <div className='w-full'>
                <HeaderAdmin />
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'} `}>
                   <div className='px-6 pb-4 flex flex-col gap-2 h-screen pt-40'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter uppercase font-medium text-gray-700'>
                                Manage Services
                            </span>
                        </div>
                        <div className='flex justify-end gap-2 mb-4'>
                            <button 
                                title="Edit"
                                onClick={() => handleEdit(selectedService)}
                                disabled={!selectedService}
                                className="px-6 py-2.5 rounded-sm bg-green-500 hover:bg-green-500 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-bold text-sm cursor-pointer">
                                EDIT
                            </button>
                            <button onClick={() => setShowForm(true)} 
                            className='py-3 px-4 flex gap-2 items-center bg-green-500 hover:bg-green-600 ease-in-out duration-300 cursor-pointer text-slate-50 rounded-sm text-sm font-bold'> 
                                ADD NEW SERVICE
                            </button>
                        </div>
                       <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-[560px] overflow-y-auto">
                          {loading ? (
                                // ← Skeleton loader while loading
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {Array.from({ length: 6 }).map((_, idx) => (
                                        <SkeletonCard key={idx} />
                                    ))}
                                </div>
                            ) : services.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No services yet</h3>
                                        <p className="text-gray-500 text-lg">Get started by adding your first service above.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {services.map((service) => (
                                        <div 
                                            key={service._id}
                                            onClick={() => setSelectedService(service)}
                                            className={`relative bg-white rounded-xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg ${
                                                selectedService?._id === service._id 
                                                    ? 'border-green-500 shadow-lg ring-2 ring-green-200' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >

                                            {/* ---- IMAGE CAROUSEL ---- */}
                                            {service.images && service.images.length > 0 && (
                                                <div 
                                                    className="relative w-full overflow-hidden rounded-t-xl h-48"
                                                    onClick={(e) => e.stopPropagation()}   // ← Prevents card click
                                                >
                                                    <div className="relative h-full w-full">
                                                        <div
                                                            className="flex transition-transform duration-300 ease-out"
                                                            style={{ transform: `translateX(-${service.carouselIndex || 0}00%)` }}
                                                        >
                                                            {service.images.map((img, idx) => (
                                                                <img
                                                                    key={idx}
                                                                    src={img}
                                                                    className="w-full h-48 object-cover flex-shrink-0"
                                                                />
                                                            ))}
                                                        </div>

                                                        {/* Prev */}
                                                        {service.images.length > 1 && (
                                                            <button
                                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setServices(prev =>
                                                                        prev.map(s =>
                                                                            s._id === service._id
                                                                                ? {
                                                                                    ...s,
                                                                                    carouselIndex:
                                                                                        ((service.carouselIndex || 0) - 1 + service.images.length) %
                                                                                        service.images.length
                                                                                }
                                                                                : s
                                                                        )
                                                                    );
                                                                }}
                                                            >
                                                                ‹
                                                            </button>
                                                        )}

                                                        {/* Next */}
                                                        {service.images.length > 1 && (
                                                            <button
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 p-2 rounded-full shadow hover:bg-white"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setServices(prev =>
                                                                        prev.map(s =>
                                                                            s._id === service._id
                                                                                ? {
                                                                                    ...s,
                                                                                    carouselIndex:
                                                                                        ((service.carouselIndex || 0) + 1) % service.images.length
                                                                                }
                                                                                : s
                                                                        )
                                                                    );
                                                                }}
                                                            >
                                                                ›
                                                            </button>
                                                        )}

                                                        {/* Dots */}
                                                        <div className="absolute bottom-2 w-full flex justify-center gap-1"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {service.images.map((_, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className={`w-2 h-2 rounded-full ${
                                                                        (service.carouselIndex || 0) === idx ? 'bg-white' : 'bg-white/50'
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* ---- CARD CONTENT ---- */}
                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 pr-2">
                                                        {service.name}
                                                    </h3>
                                                </div>

                                                <div className="mb-6">
                                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3" title={service.description}>
                                                        {service.description}
                                                    </p>
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700">Fixed Price</span>
                                                            <span className="text-2xl font-bold text-gray-900">
                                                                {formatCurrency(service.price)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                            </svg>
                                                            {service.duration} {service.duration > 1 ? 'hours' : 'hour'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                    
                    {showForm && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                            <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                                <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <Package className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {editingId ? 'Edit Service Package' : 'Create New Service'}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-6 overflow-y-auto flex-1">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {editingId && formData.existingImages.length > 0 && (
                                            <div>
                                                <div className="flex items-center mb-4">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                    <h4 className="text-sm font-semibold text-gray-700 uppercase">Current Images</h4>
                                                </div>
                                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                                                    <div className="flex flex-wrap gap-3">
                                                        {formData.existingImages.map((img, idx) => (
                                                            <div key={idx} className="relative group">
                                                                <img
                                                                    src={img}
                                                                    alt={`Service ${idx + 1}`}
                                                                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 group-hover:border-red-300 transition-colors"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFormData({
                                                                            ...formData,
                                                                            existingImages: formData.existingImages.filter((_, i) => i !== idx),
                                                                            removedImages: [...formData.removedImages, img],
                                                                        });
                                                                    }}
                                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors opacity-0 group-hover:opacity-100">
                                                                    <FaTrash size={10} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-2">Click the trash icon to remove images</p>
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center mb-4">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase">Service Information</h4>
                                            </div>
                                            <div>
                                                <div>
                                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                        <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">1</span>
                                                            Service Name
                                                        <span className="text-red-500 ml-1">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter service name"
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                            className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800 text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">Descriptive name for the service</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center mb-4">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                <h4 className="text-sm font-semibold text-gray-700 uppercase">Service Details</h4>
                                            </div>
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                    <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">3</span>
                                                    Service Description
                                                    <span className="text-red-500 ml-1">*</span>
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        placeholder="Describe your service in detail"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-md focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800 resize-none text-sm"
                                                        rows={4}
                                                        required
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-gray-500">Detailed description of what the service includes</p>
                                                    <p className="text-xs text-gray-400">{formData.description.length} characters</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Service Price
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={formData.price || ""}
                                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                    className="w-full border-2 border-gray-200 rounded-md px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                                    Service Duration (hours)
                                                </label>
                                                <div className='relative'>
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                                    <Timer className="w-4 h-4" />
                                                    </span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Enter duration"
                                                        value={formData.duration || ""}
                                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                                        className="w-full border-2 pl-8 border-gray-200 rounded-md text-sm px-3 py-2"
                                                    />
                                                </div>     
                                            </div>
                                        </div>
                                     
                                        <div className='flex'>
                                            <div>
                                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                    <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">4</span>
                                                    Upload Images
                                                    {!editingId && <span className="text-red-500 ml-1">*</span>}
                                                </label>
                                                <div className="relative">
                                                   
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        multiple
                                                        onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files) })}
                                                        className="w-full pl-2 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                                                        required={!editingId}
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Select multiple images to showcase your service (JPG, PNG, GIF)</p>
                                            </div>
                                            <div className="mb-6">
                                                <label className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.showOnHome}
                                                        onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                                                        className="cursor-pointer"
                                                    />
                                                    <span className="text-sm font-semibold text-gray-700 cursor-pointer">
                                                        Show this service on homepage
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500">
                                            {editingId ? 'Update existing service package' : 'Create new service offering'}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForm(false);
                                                    setFormData({
                                                        name: "",
                                                        description: "",
                                                        price: "",
                                                        duration: "",
                                                        images: [],
                                                        existingImages: [],
                                                        removedImages: [],
                                                        showOnHome: false
                                                    });

                                                    setEditingId(null);
                                                    setSelectedService(null)
                                                }}
                                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                            >
                                                Cancel
                                            </button>
                                           <button
                                                type="submit"
                                                onClick={handleSubmit}
                                                disabled={loading} // disable while loading
                                                className={`px-6 py-2.5 bg-green-600 text-white rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer text-sm ${
                                                    loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'
                                                }`}
                                            >
                                                {loading ? (
                                                    <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4l-3 3 3 3h-4z"></path>
                                                    </svg>
                                                ) : (
                                                    editingId ? 'Update Service' : 'Submit'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {showImageModal && imageService && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                            <div className="bg-white rounded-sm shadow-2xl w-full max-w-5xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                                <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <Image className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{imageService.name}</h3>
                                                <p className="text-sm text-gray-300">Service Image Gallery</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-6 overflow-y-auto flex-1">
                                    {imageService.images && (
                                        <>
                                            <div className="mb-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            Image Gallery
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {imageService.images.length} image{imageService.images.length > 1 ? 's' : ''} available
                                                        </p>
                                                    </div>
                                                    <div className="bg-green-50 px-3 py-1 rounded-full">
                                                        <span className="text-sm font-medium text-green-700">
                                                            {imageService.images.length} Photos
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {imageService.images.map((img, idx) => (
                                                    <div key={idx} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
                                                        <div className="aspect-w-16 aspect-h-12 relative">
                                                            <img
                                                                src={img}
                                                                alt={`${imageService.name} - Image ${idx + 1}`}
                                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                        </div>
                                                    
                                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2 shadow-sm">
                                                            <span className="text-xs font-medium text-gray-700">
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                            <div className="flex space-x-1">
                                                               <button type="button"
                                                                    onClick={() => {
                                                                        window.open(`${img}`, "_blank");
                                                                    }}
                                                                    className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200 shadow-sm cursor-pointer"
                                                                    title="View full size"
                                                                    >
                                                                    <Search className="w-4 h-4 text-gray-700" />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="p-3 bg-white">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">
                                                                    Image {idx + 1}
                                                                </span>
                                                                <span className="text-xs text-gray-400">
                                                                    JPG
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500">
                                            {imageService.images && imageService.images.length > 0 
                                                ? `Viewing ${imageService.images.length} image${imageService.images.length > 1 ? 's' : ''} for ${imageService.name}`
                                                : `No images available for ${imageService.name}`
                                            }
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowImageModal(false);
                                                    setImageService(null);
                                                }}
                                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                            >
                                                Close
                                            </button>
                                        </div>
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

export default AdminServices;