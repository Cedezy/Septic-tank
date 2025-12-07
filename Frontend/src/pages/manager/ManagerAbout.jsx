import React, { useState, useEffect } from 'react';
import SidebarManager from '../../components/SidebarManager';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { Info, Building2 } from 'lucide-react';

const ManagerAbout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [aboutData, setAboutData] = useState(null);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const res = await axios.get('/about', { withCredentials: true });
                setAboutData(res.data.about[0]);
            } catch (err) {
                console.log(err);
            }
        };
        fetchAbout();
    }, []);

    return (
        <div className="min-h-screen flex">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarManager isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        <h2 className='text-center text-3xl font-medium text-gray-700'>ABOUT US</h2>
                        {aboutData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Mission */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Mission</h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{aboutData.mission}</p>
                                </div>

                                {/* Vision */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Vision</h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{aboutData.vision}</p>
                                </div>

                                {/* Organizational Structure */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 col-span-2">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Organizational Structure</h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{aboutData.organizationStructure}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerAbout;
