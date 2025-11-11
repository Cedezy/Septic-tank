import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Loading from '../../components/Loading';

const AboutUs = () => {
    const [aboutUs, setAboutUs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAboutUs = async () => {
        try {
            const response = await axios.get('/about');
            setAboutUs(response.data.about);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAboutUs();
    }, []);

    if (loading) {
        return (
            <div className='min-h-screen'>
                <Header />
                <div className='flex items-center justify-center min-h-screen'>
                    <Loading />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-white'>
            <Header />
            <div className='pt-28 pb-20 max-w-5xl mx-auto px-4 space-y-20'>
                <h2 className="text-center text-4xl md:text-5xl text-gray-800 uppercase tracking-tight mb-10">
                    About us
                </h2>

                {aboutUs.map((about, index) => (
                    <div key={index} className='space-y-16'>
                        {/* Mission */}
                        <section className='bg-green-50 p-8 rounded-2xl shadow-sm'>
                            <h2 className='text-3xl font-semibold text-green-700 mb-4'>Our Mission</h2>
                            <p className='text-lg text-gray-700 leading-relaxed'>{about.mission}</p>
                        </section>

                        {/* Vision */}
                        <section className='bg-green-50 p-8 rounded-2xl shadow-sm'>
                            <h2 className='text-3xl font-semibold text-green-700 mb-4'>Our Vision</h2>
                            <p className='text-lg text-gray-700 leading-relaxed'>{about.vision}</p>
                        </section>

                        {/* Organizational Structure */}
                        <section className='bg-green-50 p-8 rounded-2xl shadow-sm'>
                            <h2 className='text-3xl font-semibold text-green-700 mb-4'>Organizational Structure</h2>
                            <p className='text-lg text-gray-700 leading-relaxed whitespace-pre-line'>
                                {about.organizationStructure}
                            </p>
                        </section>
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default AboutUs;
