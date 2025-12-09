import React, { useState, useEffect } from "react";
import HeaderAdmin from "../../components/HeaderAdmin";
import SidebarManager from "../../components/SidebarManager";
import axios from "../../lib/axios";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ManagerGallery = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [services, setServices] = useState([]);
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
        <div className="flex h-screen overflow-hidden">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarManager
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed((prev) => !prev)}
                />
                <div
                    className={`flex-1 transition-all duration-300 p-8 overflow-y-auto max-h-[calc(100vh-120px)] ${
                        isCollapsed ? "ml-16" : "ml-72"
                    }`}
                >
                    <h2 className="text-center text-gray-700 font-medium text-3xl">GALLERY</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerGallery;
