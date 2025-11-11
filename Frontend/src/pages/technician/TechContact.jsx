import React, { useState, useEffect } from 'react';
import SidebarTech from '../../components/SidebarTech';
import axios from '../../lib/axios';
import { Phone, Mail, MapPin, Facebook, Info, ChevronLeft } from 'lucide-react';

const TechContact = () => {
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
        <SidebarTech>
            <div className="max-w-7xl mx-auto md:py-8">
                {contactData && (
                    <div className="space-y-8">
                        {/* Header Section */}
                        <div className="relative overflow-hidden rounded-sm bg-green-500 p-12 shadow-sm">
                            <div className="absolute inset-0 bg-black opacity-5"></div>
                            <div className="relative">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                                    <Phone className="w-4 h-4 text-white" />
                                    <span className="text-sm font-medium text-white">Company Contact Info</span>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
                                    Official Company Contact and Support
                                </h1>
                                <p className="text-md md:text-xl text-green-50 font-light italic">
                                    View the company’s contact details and support information.
                                </p>
                            </div>
                        </div>

                        {/* Contact Information Cards */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-10">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700 mb-2">Contact Information</h2>
                                        <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1">
                                            <Phone className="w-4 h-4 text-slate-500" />
                                            Phone Number
                                        </label>
                                        <p className="bg-slate-100 px-4 py-3 rounded-sm text-gray-800">{contactData.phone}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1">
                                            <Mail className="w-4 h-4 text-slate-500" />
                                            Email Address
                                        </label>
                                        <p className="bg-slate-100 px-4 py-3 rounded-sm text-gray-800">{contactData.email}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1">
                                            <MapPin className="w-4 h-4 text-slate-500" />
                                            Business Address
                                        </label>
                                        <p className="bg-slate-100 px-4 py-3 rounded-sm text-gray-800">{contactData.address}</p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-1">
                                            <Facebook className="w-4 h-4 text-slate-500" />
                                            Facebook Page <span className="text-slate-400 text-xs">(optional)</span>
                                        </label>
                                        <p className="bg-slate-100 px-4 py-3 rounded-sm text-gray-800 break-words">
                                            {contactData.facebook || '—'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="bg-white rounded-sm shadow-sm border border-slate-200 p-10">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                        <Info className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Contact Information Usage</h2>
                                        <p className="text-sm text-slate-500">How this information is used</p>
                                    </div>
                                </div>

                                <p className="text-md text-slate-600 leading-relaxed">
                                    This contact information is displayed publicly to help customers reach our company for inquiries, appointments, or service requests. Only the system administrator can modify this data.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarTech>
    );
};

export default TechContact;
