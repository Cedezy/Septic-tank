import React, { useState, useEffect } from 'react';
import SidebarManager from '../../components/SidebarManager';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../api/axios';
import { Mail, Phone, MapPin, Facebook, Info } from 'lucide-react';

const ManagerContact = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [contactData, setContactData] = useState(null);

    useEffect(() => {
        const fetchContact = async () => {
            try{
                const response = await axios.get('/contact', { 
                    withCredentials: true
                });
                setContactData(response.data.contact[0]);
            } 
            catch(err){
                console.error(err);
            }
        };

        fetchContact();
    }, []);

    return (
        <div className="min-h-screen flex bg-gray-50">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarManager isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="max-w-full mx-auto p-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-green-500 px-8 py-6">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    📞 Contact Information
                                </h2>
                            </div>
                            <div className="p-8 grid grid-cols-2 gap-5">
                                {contactData && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-slate-500" />
                                                Phone Number
                                            </label>
                                            <div className="bg-slate-100 px-4 py-3 rounded-xl text-gray-800">
                                                {contactData.phone}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-500" />
                                                Email Address
                                            </label>
                                            <div className="bg-slate-100 px-4 py-3 rounded-xl text-gray-800">
                                                {contactData.email}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-slate-500" />
                                                Business Address
                                            </label>
                                            <div className="bg-slate-100 px-4 py-3 rounded-xl text-gray-800">
                                                {contactData.address}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                <Facebook className="w-4 h-4 text-slate-500" />
                                                Facebook Page <span className="text-slate-400 text-xs">(optional)</span>
                                            </label>
                                            <div className="bg-slate-100 px-4 py-3 rounded-xl text-gray-800 break-words">
                                                {contactData.facebook || '—'}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
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
                </div>
            </div>
        </div>
    );
};

export default ManagerContact;
