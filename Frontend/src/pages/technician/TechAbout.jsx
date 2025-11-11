import React, { useState, useEffect } from 'react';
import SidebarTech from '../../components/SidebarTech';
import axios from '../../lib/axios';
import { Info, Building2, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TechAbout = () => {
    const [aboutData, setAboutData] = useState(null);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const response = await axios.get('/about', { withCredentials: true });
                setAboutData(response.data.about[0]);
            } catch (err) {
                console.log(err);
            }
        };
        fetchAbout();
    }, []);

    return (
        <SidebarTech>
            <div className="max-w-7xl mx-auto">
                {aboutData && (
                    <div className="space-y-8">
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
                                <p className="text-md text-slate-600 leading-relaxed">{aboutData.mission}</p>
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
                                <p className="text-md text-slate-600 leading-relaxed">{aboutData.vision}</p>
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
                                <p className="text-md text-slate-600 leading-relaxed">{aboutData.organizationStructure}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarTech>
    );
};

export default TechAbout;
