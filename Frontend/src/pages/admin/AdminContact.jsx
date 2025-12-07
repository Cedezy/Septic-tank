import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { Phone, Mail, MapPin, Facebook, Check, Info } from 'lucide-react';

const AdminContact = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [contact, setContact] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchContact = async () => {
            try {
                const res = await axios.get('/contact', { withCredentials: true });
                setContact(res.data.contact[0]);
            } catch (err) {
                console.log(err);
            }
        };
        fetchContact();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put('/contact', contact, { withCredentials: true });
            toast.success(res.data.message);
            setEditing(false);
        } catch (err) {
            console.log(err);
            toast.error('Failed to update contact info');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="p-8 max-w-7xl mx-auto space-y-8">
                        <h2 className='text-center text-3xl text-gray-700 font-medium'>CONTACT US</h2>
                        {contact && (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Phone */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                                <Phone className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-slate-700">Phone Number</h2>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                value={contact.phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        ) : (
                                            <p className="text-slate-600">{contact.phone}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                                <Mail className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-slate-700">Email Address</h2>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={contact.email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        ) : (
                                            <p className="text-slate-600">{contact.email}</p>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                                <MapPin className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-slate-700">Business Address</h2>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="address"
                                                value={contact.address}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        ) : (
                                            <p className="text-slate-600">{contact.address}</p>
                                        )}
                                    </div>

                                    {/* Facebook */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-gradient-to-br from-green-500 to-orange-400 rounded-xl shadow-lg">
                                                <Facebook className="w-5 h-5 text-white" />
                                            </div>
                                            <h2 className="text-lg font-semibold text-slate-700">Facebook Page</h2>
                                        </div>
                                        {editing ? (
                                            <input
                                                type="text"
                                                name="facebook"
                                                value={contact.facebook || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        ) : (
                                            <p className="text-slate-600">{contact.facebook || '—'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-md p-4 col-span-2 mt-8">
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

                                <div className="flex justify-end mt-6">
                                    {!editing && (
                                        <button
                                            type="button"
                                            onClick={() => setEditing(true)}
                                            className="px-6 py-2 bg-green-500 text-white rounded-sm font-bold hover:bg-green-600"
                                        >
                                            EDIT
                                        </button>
                                    )}
                                </div>
                                {editing && (
                                    <div className="flex justify-end mt-6">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 cursor-pointer py-2 bg-green-500 text-white rounded-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </form>
                        )}
                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContact;
