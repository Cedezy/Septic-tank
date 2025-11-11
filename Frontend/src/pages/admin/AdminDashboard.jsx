import React, { useState, useEffect } from "react";
import HeaderAdmin from "../../components/HeaderAdmin";
import SidebarAdmin from "../../components/SidebarAdmin";
import Slider from "react-slick";
import axios from "../../api/axios";
import { Image, FolderPlus, ChevronLeft, ChevronRight } from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const AdminDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [services, setServices] = useState([]);

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

    const CustomNextArrow = (props) => {
        const { onClick } = props;
        return (
            <div className="custom-next" onClick={onClick}>
                <ChevronRight className="h-20 w-20 text-white bg-green-600/70 rounded-full p-2 shadow-lg hover:bg-green-700 transition-all duration-300" />
            </div>
        );
    };

    const CustomPrevArrow = (props) => {
        const { onClick } = props;
        return (
            <div className="custom-prev" onClick={onClick}>
                <ChevronLeft className="h-20 w-20 text-white bg-green-600/70 rounded-full p-2 shadow-lg hover:bg-green-700 transition-all duration-300" />
            </div>
        );
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        nextArrow: <CustomNextArrow />,
        prevArrow: <CustomPrevArrow />,
    };


    return (
        <div className="flex h-screen overflow-hidden">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed((prev) => !prev)} />
                <div className={`flex-1 transition-all duration-300 p-8 ${isCollapsed ? "ml-16" : "ml-72"}`}>
                    <div className="h-[80vh] flex items-center justify-center px-4">
                        <div className="w-full max-w-7xl mb-10">
                            <Slider {...settings}>
                                {services.map((service) =>
                                    service.images?.map((img, i) => (
                                        <div key={`${service._id}-${i}`} className="px-4">
                                            <div className="relative overflow-hidden rounded-3xl shadow-2xl group">
                                                <img
                                                    src={`${BASE_URL}${img}`}
                                                    alt={`${service.name}-${i}`}
                                                    className="w-full h-[75vh] object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                                <div className="absolute bottom-0 left-0 right-0 p-10">
                                                    <div className="backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20">
                                                        <h2 className="text-white text-4xl font-bold tracking-tight mb-3 drop-shadow-lg">
                                                            {service.name}
                                                        </h2>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-white/90 text-base font-medium">
                                                                Image {i + 1} of {service.images.length}
                                                            </p>
                                                            <div className="flex gap-1.5">
                                                                {[...Array(service.images.length)].map((_, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                                                            idx === i 
                                                                                ? 'w-8 bg-green-500' 
                                                                                : 'w-1.5 bg-white/40'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </Slider>
                        </div>
                    </div>

                </div>
            </div>

        <style jsx>{`
            .custom-prev,
            .custom-next {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 20; /* above image & overlay */
                cursor: pointer;
            }

            .custom-prev {
                left: 20px; /* inside the left of the image */
            }

            .custom-next {
                right: 20px; /* inside the right of the image */
            }

            .custom-prev:hover,
            .custom-next:hover {
                transform: translateY(-50%) scale(1.15); /* grow slightly on hover */
            }

            .slick-dots li button:before {
                color: #22c55e;
                font-size: 12px;
            }

            .slick-dots li.slick-active button:before {
                color: #15803d;
            }
        `}</style>



        </div>
    );
};

export default AdminDashboard;