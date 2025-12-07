import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const Home = () => {
    const { user, loading } = useAuth();
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const res = await axios.get("/service");
                const allImages = [];

                res.data.services.forEach((service) => {
                    if (service.images?.length > 0) {
                        service.images.forEach((img) =>
                            allImages.push(`${BASE_URL}${img}`)
                        );
                    }
                });

                setImages(allImages);
            } catch (err) {
                console.error("Failed to fetch images", err);
            }
        };

        fetchImages();
    }, []);

    useEffect(() => {
        if (images.length === 0) return;

        const interval = setInterval(
            () => setCurrentIndex((prev) => (prev + 1) % images.length),
            4000
        );

        return () => clearInterval(interval);
    }, [images]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                Loading...
            </div>
        );
    }

    // HERO BUTTONS SHOWN ONLY IF NOT LOGGED IN
    const heroLinks = [
        { label: "Services", href: "/services" },
        { label: "About Us", href: "/aboutus" },
        { label: "FAQs", href: "/faqs" },
        { label: "Contact Us", href: "/contactus" },
    ];

    return (
        <div className="min-h-screen w-full relative">
            <Header />

            <div className="w-full h-screen relative overflow-hidden">
                {images.length > 0 ? (
                    images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                                index === currentIndex ? "opacity-100" : "opacity-0"
                            }`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                        

                    ))
       ) : (
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('/fallback-hero.jpg')` }}
                    />
                )}

                <div className="absolute inset-0 bg-black/30"></div>

                {/* ONLY SHOW HERO BUTTONS IF USER NOT LOGGED IN */}
               {/* IF NOT LOGGED IN → SHOW BUTTONS */}
                {!user && (
                    <div className="relative z-10 flex flex-col sm:flex-row gap-1 px-4 h-full justify-center items-center">
                        {heroLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="w-xs py-8 text-4xl uppercase font-bold bg-green-500 text-white rounded-4xl shadow-md hover:bg-green-600 transition-all text-center tracking-wide"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>
                )}

                {/* IF LOGGED IN → SHOW WELCOME TEXT */}
                {user && user.role === "customer" && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-20">
                        <h2
                            className={`text-white font-bold uppercase leading-tight drop-shadow-lg 
                                ${(!user || user.role !== "customer")
                                    ? "text-2xl sm:text-3xl md:text-5xl lg:text-6xl"
                                    : "text-4xl sm:text-3xl md:text-4xl lg:text-5xl"
                                } 
                                max-w-[95%] sm:max-w-xl md:max-w-3xl
                            `}
                            style={{ fontFamily: "'Rubik', sans-serif" }}
                        >
                            Reliable Septic & Grease Management Services
                        </h2>

                    
                    </div>
                )}

            </div>
        </div>
    );
};

export default Home;
