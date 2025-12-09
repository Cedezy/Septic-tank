import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import { Building2, Info  } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
    const [aboutUs, setAboutUs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

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
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-white'>
            <Header />
            <div className='pt-28 pb-20 max-w-7xl mx-auto px-4 space-y-4'>
                <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-gray-600 hover:text-gray-800 flex items-center gap-1 ml-4"
                    >
                    <span className="text-xl">←</span>
                    <span className="text-md font-medium">Back</span>
                </button>
                {aboutUs.map((about, index) => (
                    <div key={index} className="space-y-8">
                        <div className="relative overflow-hidden rounded-sm bg-green-500 p-12 shadow-sm">
                            <div className="absolute inset-0 bg-black opacity-5"></div>
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                    <Building2 className="w-4 h-4 text-white" />
                                    <span className="text-sm font-medium text-white">Company Overview</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">RMG Septic Tank Cleaning Services</h1>
                                <p className="text-md md:text-xl text-green-50 font-light italic">Reliable, Professional, and Timely Septic Tank Maintenance</p>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-10'>
                            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 md:col-span-1">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700 mb-1">Mission</h2>
                                    </div>
                                </div>
                                <p className="text-md text-slate-600 leading-relaxed">{about.mission}</p>
                            </div>

                            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 md:col-span-1">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700 mb-1">Vision</h2>
                                    </div>
                                </div>
                                <p className="text-md text-slate-600 leading-relaxed">{about.vision}</p>
                            </div>

                            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-8 md:col-span-1">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700 mb-1">Organizational Structure</h2>
                                    </div>
                                </div>
                                <p className="text-md text-slate-600 leading-relaxed">{about.organizationStructure}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutUs;
