import React, { useState, useEffect } from 'react';
import SidebarManager from '../../components/SidebarManager';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { Info } from 'lucide-react';

const ManagerContact = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [contactData, setContactData] = useState(null);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const response = await axios.get('/contact', { withCredentials: true });
                setContactData(response.data.contact[0]);
            } catch (err) {
                console.error(err);
            }
        };
        fetchContact();
    }, []);

    return (
        <div className="min-h-screen flex">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarManager isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        <h2 className='text-center font-medium text-3xl'>CONTACT US</h2>
                        {contactData && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Phone */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Phone Number</h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{contactData.phone}</p>
                                </div>

                                {/* Email */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Email Address</h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{contactData.email}</p>
                                </div>

                                {/* Business Address */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Business Address</h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{contactData.address}</p>
                                </div>

                                {/* Facebook Page */}
                                <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                    <div className="flex items-start gap-4 mb-4">
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">
                                            Facebook Page 
                                        </h2>
                                    </div>
                                    <p className="text-md text-slate-600 leading-relaxed">{contactData.facebook || '—'}</p>
                                </div>

                                {/* Info Box */}
                                <div className="bg-green-50 border border-green-200 rounded-md p-4 col-span-2">
                                    <div className="flex items-start">
                                        <Info className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-green-800 mb-1">Contact Information Usage</h4>
                                            <p className="text-sm text-green-700">
                                                This information is visible to website visitors for customer support and inquiries. Only authorized admins can modify this information.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerContact;
