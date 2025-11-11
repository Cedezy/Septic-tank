import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import {
    Edit3,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Check,
    Info
} from 'lucide-react';

const AdminContact = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [contact, setContact] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(false); // <-- track edit mode

    const fetchContact = async () => {
        try {
            const response = await axios.get('/contact');
            setContact(response.data.contact[0]);
        } catch (err) {
            console.log(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setContact(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await axios.put('/contact', contact, { withCredentials: true });
            toast.success(response.data.message);
            setEditing(false); // exit edit mode after saving
        } catch (err) {
            console.log(err);
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchContact();
    }, []);

    return (
        <div className="min-h-screen flex">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="max-w-full mx-auto p-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-semibold text-slate-900">Company Contact Details</h2>
                                </div>
                                {!editing && (
                                    <button
                                        type="button"
                                        onClick={() => setEditing(true)}
                                        className="px-6 py-2 bg-green-500 text-white rounded-sm font-bold cursor-pointer hover:bg-green-600 ease-in-out duration-300"
                                    >
                                        EDIT
                                    </button>
                                )}
                            </div>

                            <div className="p-8">
                                {contact && (
                                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">
                                        {/* Phone */}
                                        <div className="group">
                                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                                <Phone className="w-4 h-4 mr-2 text-slate-500" />
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={contact.phone}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                className={`w-full border px-4 py-3 rounded-xl transition-all duration-200 
                                                    ${editing ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500' 
                                                              : 'border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="group">
                                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                                <Mail className="w-4 h-4 mr-2 text-slate-500" />
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={contact.email}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                className={`w-full border px-4 py-3 rounded-xl transition-all duration-200 
                                                    ${editing ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500' 
                                                              : 'border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                            />
                                        </div>

                                        {/* Address */}
                                        <div className="group">
                                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-slate-500" />
                                                Business Address
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={contact.address}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                className={`w-full border px-4 py-3 rounded-xl transition-all duration-200 
                                                    ${editing ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500' 
                                                              : 'border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                            />
                                        </div>

                                        {/* Facebook */}
                                        <div className="group">
                                            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center">
                                                <Facebook className="w-4 h-4 mr-2 text-slate-500" />
                                                Facebook Page <span className="text-slate-400 text-xs ml-2">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="facebook"
                                                value={contact.facebook || ''}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                className={`w-full border px-4 py-3 rounded-xl transition-all duration-200 
                                                    ${editing ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500' 
                                                              : 'border-slate-200 bg-slate-50 cursor-not-allowed'}`}
                                            />
                                        </div>
                                        <div className="pt-4 col-span-2">
                                            {editing && (
                                                
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="px-8 bg-green-500 text-slate-50 py-3 rounded-lg font-semibold hover:bg-green-600 ease-in-out duration-300 cursor-pointer"
                                                >
                                                    {saving ? (
                                                        <div className="flex items-center justify-center">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                                                            Saving Changes...
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-center">
                                                            <Check className="w-5 h-5 mr-2" />
                                                            Save Changes
                                                        </div>
                                                    )}
                                                </button>
                                               
                                            )}
                                         </div>
                                    </form>
                                )}
                            </div>

                        </div>
                        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start">
                                <Info className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-semibold text-green-800 mb-1">Contact Information Usage</h4>
                                    <p className="text-sm text-green-700">
                                        This information will be displayed on your website's contact page and used for customer inquiries.
                                        Make sure all details are accurate and up-to-date.
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


export default AdminContact;
