import React, { useState, useEffect } from 'react';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { Info, Check } from 'lucide-react';

const AdminAbout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [aboutData, setAboutData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchAbout = async () => {
        try {
            const res = await axios.get('/about', { withCredentials: true });
            setAboutData(res.data.about[0]);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAbout();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAboutData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axios.put('/about', aboutData);
            toast.success(res.data.message);
            setEditing(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update About Us');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            <div className="w-full">
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className="p-8 max-w-7xl mx-auto space-y-8 overflow-y-auto max-h-[calc(100vh-120px)] ">
                        <h2 className='text-center text-3xl font-medium text-gray-700'>ABOUT US</h2>
                        {aboutData && (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Mission */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                        <div className="flex items-start gap-4 mb-4">
                                            <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Mission</h2>
                                        </div>
                                        {editing ? (
                                            <textarea
                                                name="mission"
                                                value={aboutData.mission || ''}
                                                onChange={handleChange}
                                                rows={5}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                            />
                                        ) : (
                                            <p className="text-md text-slate-600 leading-relaxed">{aboutData.mission}</p>
                                        )}
                                    </div>

                                    {/* Vision */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                                        <div className="flex items-start gap-4 mb-4">
                                            <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Vision</h2>
                                        </div>
                                        {editing ? (
                                            <textarea
                                                name="vision"
                                                value={aboutData.vision || ''}
                                                onChange={handleChange}
                                                rows={5}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                            />
                                        ) : (
                                            <p className="text-md text-slate-600 leading-relaxed">{aboutData.vision}</p>
                                        )}
                                    </div>

                                    {/* Organizational Structure */}
                                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 col-span-2">
                                        <div className="flex items-start gap-4 mb-4">
                                            <h2 className="text-xl font-semibold uppercase tracking-wider text-slate-700">Organizational Structure</h2>
                                        </div>
                                        {editing ? (
                                            <textarea
                                                name="organizationStructure"
                                                value={aboutData.organizationStructure || ''}
                                                onChange={handleChange}
                                                rows={8}
                                                className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono"
                                            />
                                        ) : (
                                            <p className="text-md text-slate-600 leading-relaxed">{aboutData.organizationStructure}</p>
                                        )}
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
                                            className="group relative px-6 py-2 bg-green-500 text-white rounded-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="flex items-center justify-center gap-3 uppercase">
                                                {saving ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Saving Changes...
                                                    </>
                                                ) : (
                                                    <>
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
    );
};

export default AdminAbout;
