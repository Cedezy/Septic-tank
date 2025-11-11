import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { Edit3, Check } from 'lucide-react';

const AdminAbout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [aboutData, setAboutData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchAbout = async () => {
        try {
            const res = await axios.get('/about');
            setAboutData(res.data.about[0]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAboutData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const response = await axios.put('/about', aboutData);
            toast.success(response.data.message);
            setEditing(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update About Us');
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchAbout();
    }, []);

    return (
        <div className="min-h-screen flex bg-slate-50">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin
                    isCollapsed={isCollapsed}
                    toggleCollapse={() => setIsCollapsed((prev) => !prev)}
                />
                <div
                    className={`transition-all duration-300 ${
                        isCollapsed ? 'ml-16' : 'ml-72'
                    }`}
                >
                    <div className="p-4 h-[calc(100vh-120px)] overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {aboutData && (
                                <form onSubmit={handleSubmit}>
                                    {/* Header */}
                                    <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-xl font-semibold text-slate-900">
                                                About Us Information
                                            </h2>
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

                                    {/* Form Content */}
                                    <div className="p-8 space-y-10">
                                        {/* Mission */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                Mission
                                            </h3>
                                            <textarea
                                                name="mission"
                                                value={aboutData.mission || ''}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                rows={5}
                                                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none ${
                                                    editing
                                                        ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500'
                                                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                                                }`}
                                                placeholder="Enter your company's mission..."
                                            />
                                        </div>

                                        {/* Vision */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                Vision
                                            </h3>
                                            <textarea
                                                name="vision"
                                                value={aboutData.vision || ''}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                rows={5}
                                                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none ${
                                                    editing
                                                        ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500'
                                                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                                                }`}
                                                placeholder="Enter your company's vision..."
                                            />
                                        </div>

                                        {/* Organizational Structure */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                                Organizational Structure
                                            </h3>
                                            <textarea
                                                name="organizationStructure"
                                                value={aboutData.organizationStructure || ''}
                                                onChange={handleChange}
                                                readOnly={!editing}
                                                rows={8}
                                                className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 resize-none font-mono ${
                                                    editing
                                                        ? 'border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500'
                                                        : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                                                }`}
                                                placeholder="List your organization structure (e.g. General Manager → Operations Supervisor → Staff)"
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    {editing && (
                                        <div className="px-8 py-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                                            <p className="text-sm text-slate-600">
                                                Changes will be reflected on your public website immediately.
                                            </p>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="group relative px-6 py-2 bg-green-500 text-white rounded-sm font-semibold hover:bg-green-600 ease-in-out duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center justify-center gap-3 uppercase">
                                                    {saving ? (
                                                        <>
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                            Saving Changes...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-5 h-5" />
                                                            Save Changes
                                                        </>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAbout;
