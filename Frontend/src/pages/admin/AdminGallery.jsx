import React, { useState, useEffect } from "react";
import HeaderAdmin from "../../components/HeaderAdmin";
import SidebarAdmin from "../../components/SidebarAdmin";
import axios from "../../api/axios";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from 'react-toastify';

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const AdminGallery = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editedImages, setEditedImages] = useState([]);
    const [removedImages, setRemovedImages] = useState([]);

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get("/service");
                setServices(response.data.services);
            } catch (err) {
                console.error("Error fetching services:", err);
            }
        };
        fetchServices();
    }, []);

    // Open modal
    const handleEdit = (service) => {
        setSelectedService(service);
        setEditedImages([...service.images]); // Copy images to editable state
        setSelectedFiles([]);
    };

// Close modal
    const handleCloseModal = () => {
        setSelectedService(null);
        setEditedImages([]);
        setSelectedFiles([]);
    };

    // Handle file selection
    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    // Save / update images
    // Track deleted images


// Delete image (mark for backend)
const handleDeleteImage = (imageName) => {
    setEditedImages((prev) => prev.filter((img) => img !== imageName));
    setRemovedImages((prev) => [...prev, imageName]);
};

// Save / update images
const handleSaveChanges = async () => {
    if (!selectedService) return;
    const formData = new FormData();

    // Keep existing images
    formData.append("existingImages", JSON.stringify(editedImages));

    // Add deleted image names
    if (removedImages.length > 0) {
        formData.append("removedImages", JSON.stringify(removedImages));
    }

    // Add new uploads
    selectedFiles.forEach((file) => {
        formData.append("images", file);
    });

    try {
        await axios.put(`/service/${selectedService._id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        // Refresh list
        const response = await axios.get("/service");
        setServices(response.data.services);
        toast.success("Images updated successfully!");

        // Reset states
        setRemovedImages([]);
        handleCloseModal();
    } catch (err) {
        console.error("Error updating images:", err);
    }
};

    // Slider arrows
    const NextArrow = ({ onClick }) => (
        <div
            className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer z-10 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80"
            onClick={onClick}
        >
            <ChevronRight />
        </div>
    );

    const PrevArrow = ({ onClick }) => (
        <div
            className="absolute top-1/2 left-2 transform -translate-y-1/2 cursor-pointer z-10 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-80"
            onClick={onClick}
        >
            <ChevronLeft />
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
    };

    return (
        <div className="flex h-screen">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed((prev) => !prev)}
                />
                <div
                    className={`flex-1 transition-all duration-300 p-8 ${
                        isCollapsed ? "ml-16" : "ml-72"
                    }`}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.map((service) => (
                            <div
                                key={service._id}
                                className="bg-white shadow-md rounded-md flex flex-col items-center relative"
                            >
                                {service.images.length > 0 ? (
                                    <Slider {...sliderSettings} className="w-full h-52">
                                        {service.images.map((img, index) => (
                                            <div key={index}>
                                                <img
                                                    src={`${BASE_URL}${img}`}
                                                    alt={`${service.name}-${index}`}
                                                    className="w-full h-52 object-cover rounded-t-md"
                                                />
                                            </div>
                                        ))}
                                    </Slider>
                                ) : (
                                    <div className="w-full h-52 bg-gray-200 flex items-center justify-center rounded-t-md">
                                        No Image
                                    </div>
                                )}
                                <div className="flex flex-col justify-center items-center p-4">
                                    <h3 className="text-lg font-semibold">{service.name}</h3>
                                    <button
                                        onClick={() => handleEdit(service)}
                                        className="mt-2 px-4 py-1 font-semibold bg-green-500 text-white rounded hover:bg-green-600"
                                    >
                                        EDIT
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

          {selectedService && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-white rounded-lg shadow-lg w-[500px] max-w-full p-6 relative">
                    <button
                        onClick={handleCloseModal}
                        className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                    >
                        <X />
                    </button>
                    <h2 className="text-xl font-semibold mb-4">
                        Edit Images - {selectedService.name}
                    </h2>

                    {editedImages.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {editedImages.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={`${BASE_URL}${img}`}
                                        alt={`current-${index}`}
                                        className="w-full h-28 object-cover rounded"
                                    />
                                    <button
                                        onClick={() => handleDeleteImage(img)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                        title="Delete this image"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 mb-4">No existing images.</p>
                    )}

                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Upload new images
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none p-2"
                    />

                    {selectedFiles.length > 0 && (
                        <div className="mt-3 text-sm text-gray-600">
                            {selectedFiles.length} file(s) selected
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
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
