import React, { useEffect } from 'react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import Services from '../../components/Services';
import ContactUs from '../../components/ContactUs'
import hero from '../../assets/hero.jpg'
import { Check, Phone, Mail } from 'lucide-react';
import Footer from '../../components/Footer';
import Loading from '../../components/Loading';
import AOS from 'aos';
import 'aos/dist/aos.css';
import LoginCustomer from './LoginCustomer';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
    const { user, loading } = useAuth();

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: false,
        });
    }, []);
    
    if(loading){
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50'>
                <Loading/>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header>
                <Header />
            </header>
            <div className="relative flex justify-center items-center min-h-[calc(100vh-6rem)] bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${hero})`}}>
            <div className="absolute inset-0 bg-black/50 z-0" />
                <div data-aos="fade-up" className="relative z-10 max-w-7xl px-4 flex flex-col items-center gap-3 p-6 rounded-xl">
                    <div className='flex justify-center items-center'>
                        <div className='flex justify-center items-center text-center'>
                            <h2 className="text-slate-200 text-2xl sm:text-6xl font-bold uppercase leading-tight"
                                style={{ fontFamily: "'Rubik', sans-serif" }}>
                                Reliable Septic & Grease Management Services
                            </h2>
                        </div>
                        {(!user || user.role !== 'customer') && (
                            <LoginCustomer onLoginSuccess={() => {}} />
                        )}
                    </div>
                </div>
            </div>

            <section className='bg-gray-50'>
                <Services showHomeOnly={true} />
            </section>
                    
            <section>
                <Footer/>
            </section>
        </div>
    );
};

export default Home;
