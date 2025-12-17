import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useAuth } from "../../context/AuthContext";
import axios from "../../lib/axios";
import Services from "../../components/Services";
import Loading from "../../components/Loading";

const Home = () => {
    const { user, loading: authLoading } = useAuth();
    const [services, setServices] = useState([]);
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchImages = async () => {
            try {
                setLoading(true); 
                const res = await axios.get("/service");
                const allImages = [];
                const filteredServices = res.data.services.filter(
                    (service) => service.status === "Active" && service.showOnHome === true
                );

                filteredServices.forEach((service) => {
                    if (service.images?.length > 0) {
                        service.images.forEach((img) =>
                            allImages.push(img)
                        );
                    }
                });

                setImages(allImages);
                setServices(filteredServices);

            } catch (err) {
                console.error("Failed to fetch images", err);
            }finally {
                setLoading(false); // stop loading
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

    const heroLinks = [
        { label: "Services", href: "/services" },
        { label: "About Us", href: "/aboutus" },
        { label: "FAQs", href: "/faqs" },
        { label: "Contact Us", href: "/contactus" },
    ];

    if (authLoading || loading) {
        return <Loading />;
    }

    return (
        <div className="min-h-screen w-full relative">
            <Header />
            <div className="w-full h-screen relative overflow-hidden">
                {images.length > 0 ? (
                    images.map((img, index) => (
                        <div key={index}
                            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                                index === currentIndex ? "opacity-100" : "opacity-0"
                            }`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))
                ) : (
                    <div className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('/fallback-hero.jpg')` }}
                    />
                )}

                <div className="absolute inset-0 bg-black/50"></div>

                {!user && (
                    <div className="relative z-10 px-4 h-full flex justify-center items-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-xl">
                            {heroLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="py-8 text-4xl uppercase font-bold bg-green-500 text-white rounded-4xl shadow-md hover:bg-green-600 ease-in-out duration-500 text-center tracking-wide"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    </div>
                )}


                {user && user.role === "customer" && (
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-20 max-w-4xl mx-auto">
                        <h2 className="text-gray-200 text-4xl md:text-7xl font-bold uppercase leading-tighter drop-shadow-md" style={{ fontFamily: "'Rubik', sans-serif" }}>
                            Reliable Septic & Grease Management Services
                        </h2>
                    </div>
                )}
            </div>

            {user && user.role === "customer" && (
                <Services services={services} showHomeOnly />
            )}

        </div>
    );
};

export default Home;
