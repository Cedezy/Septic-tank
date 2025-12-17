import React, { useState, useEffect } from "react";
import HeaderAdmin from "../../components/HeaderAdmin";
import SidebarAdmin from "../../components/SidebarAdmin";
import axios from "../../lib/axios";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";

const AdminGallery = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [editingService, setEditingService] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editedImages, setEditedImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);

    useEffect(() => {
        const fetchServices = async () => {
            try{
                const response = await axios.get("/service");
                setServices(response.data.services);
            } 
            catch(err){
                console.error("Error fetching services:", err);
            }
        };
        fetchServices();
    }, []);

    const handleEdit = (service) => {
        setEditedImages([...service.images]);
        setSelectedFiles([]);
        setEditingService(service);
    };

    const handleCloseModal = () => {
        setEditingService(null);
        setEditedImages([]);
        setSelectedFiles([]);
        setRemovedImages([]);
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleDeleteImage = (imageName) => {
        setEditedImages((prev) => prev.filter((img) => img !== imageName));
        setRemovedImages((prev) => [...prev, imageName]);
    };

    const handleSaveChanges = async () => {
        if (!editingService) return;
        const formData = new FormData();

        formData.append("existingImages", JSON.stringify(editedImages));

        if (removedImages.length > 0) {
            formData.append("removedImages", JSON.stringify(removedImages));
        }

        selectedFiles.forEach((file) => {
            formData.append("images", file);
        });

        try {
            await axios.put(`/service/${editingService._id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const response = await axios.get("/service");
            setServices(response.data.services);
            toast.success("Images updated successfully!");
            handleCloseModal();
        } catch (err) {
            console.error("Error updating images:", err);
        }
    };

    const NextArrow = ({ onClick }) => (
        <div
            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onClick();
            }}
        >
            <ChevronRight className="text-gray-800" size={20} />
        </div>
    );

    const PrevArrow = ({ onClick }) => (
        <div
            className="absolute top-1/2 left-3 transform -translate-y-1/2 cursor-pointer z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onClick();
            }}
        >
            <ChevronLeft className="text-gray-800" size={20} />
        </div>
    );


    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        dotsClass: "slick-dots !bottom-3",
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed((prev) => !prev)}
                />
                <div
                    className={`flex-1 transition-all duration-300 p-4 overflow-y-auto max-h-[calc(100vh-120px)] ${
                        isCollapsed ? "ml-16" : "ml-72"
                    }`}
                >
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-1">Gallery Management</h2>
                                <p className="text-gray-500 text-sm">
                                    {selectedService 
                                        ? `Selected: ${selectedService.name}` 
                                        : "Select a service to edit its images"}
                                </p>
                            </div>
                            <button
                                onClick={() => selectedService && handleEdit(selectedService)}
                                disabled={!selectedService}
                                className={`px-6 py-3 font-semibold rounded-md transition-all duration-200 flex items-center gap-2 shadow-md ${
                                    selectedService
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-105"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                                <Upload size={18} />
                                EDIT
                            </button>
                        </div>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div
                                key={service._id}
                                className={`bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
                                    selectedService?._id === service._id
                                        ? "ring-4 ring-green-500 ring-offset-2"
                                        : "ring-1 ring-gray-200"
                                }`}
                                onClick={() =>
                                    setSelectedService((prev) =>
                                        prev?._id === service._id ? null : service
                                    )
                                }
                            >
                                <div className="relative">
                                    {service.images.length > 0 ? (
                                        <Slider {...sliderSettings} className="w-full">
                                            {service.images.map((img, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={img}
                                                        alt={`${service.name}-${index}`}
                                                        className="w-full h-64 object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                </div>
                                            ))}
                                        </Slider>
                                    ) : (
                                        <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                            <ImageIcon className="text-gray-400 mb-2" size={48} />
                                            <span className="text-gray-500 font-medium">No Images</span>
                                        </div>
                                    )}
                                    {selectedService?._id === service._id && (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                                            Selected
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{service.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        {service.images.length} {service.images.length === 1 ? 'image' : 'images'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enhanced Modal */}
            {editingService && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-green-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-1">Edit Gallery</h2>
                                    <p className="text-green-100 text-sm">{editingService.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {/* Current Images */}
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Current Images ({editedImages.length})
                                </h3>
                                {editedImages.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {editedImages.map((img, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={img}
                                                    alt={`current-${index}`}
                                                    className="w-full h-32 object-cover rounded-lg shadow-md"
                                                />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleDeleteImage(img)}
                                                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transform hover:scale-110 transition-all"
                                                        title="Delete this image"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <ImageIcon className="text-gray-400 mx-auto mb-2" size={40} />
                                        <p className="text-gray-500">No existing images</p>
                                    </div>
                                )}
                            </div>

                            {/* Upload New Images */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                                    Upload New Images
                                </h3>
                                <label className="block">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                                        <Upload className="text-gray-400 mx-auto mb-3" size={40} />
                                        <p className="text-gray-700 font-medium mb-1">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            PNG, JPG, GIF up to 10MB
                                        </p>
                                    </div>
                                </label>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <Upload size={18} />
                                            <span className="font-medium">
                                                {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} ready to upload
                                            </span>
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {selectedFiles.map((file, idx) => (
                                                <p key={idx} className="text-sm text-green-600 truncate">
                                                    • {file.name}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                className="px-6 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;