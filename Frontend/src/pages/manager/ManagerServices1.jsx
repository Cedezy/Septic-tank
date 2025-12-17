import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import SidebarManager from '../../components/SidebarManager';
import HeaderAdmin from '../../components/HeaderAdmin';
import { formatCurrency } from '../../utils/FormatCurrency';
import { Image } from 'lucide-react';

const ManagerServices1 = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try{
            const response = await axios.get('/service');
            setServices(response.data.services); 
        } 
        catch(err){
            console.error(err);
        }
    };

    return (
        <div className="h-screen flex overflow-hidden">
            <div className='w-full'>
                <div className="mb-36">
                    <HeaderAdmin />
                </div>
                <SidebarManager isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />

                <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'} `}>
                    <div className="p-6 h-[calc(100vh-120px)] overflow-y-auto">
                        <div className='flex justify-center items-center mb-4'>
                            <span className='text-2xl tracking-tighter uppercase font-medium text-gray-700'>
                                Services
                            </span>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {services.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-3">No services yet</h3>
                                        <p className="text-gray-500 text-lg">Get started by adding your first service above.</p>
                                    </div>
                                </div>
                            ) : (

                                /* SERVICE CARDS START */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                    {services.map((service) => (
                                        <div 
                                            key={service._id}
                                            className="relative bg-white rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg"
                                        >

                                            {/* --- SERVICE IMAGE DISPLAYED HERE --- */}
                                            {service.images && service.images.length > 0 ? (
                                                <img
                                                    src={service.images[0]}
                                                    alt={service.name}
                                                    className="w-full h-48 object-cover rounded-t-xl"
                                                />
                                            ) : (
                                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-xl">
                                                    <Image className="w-10 h-10 text-gray-400" />
                                                </div>
                                            )}
                                            {/* --- END IMAGE SECTION --- */}

                                            <div className="p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <h3 className="text-lg font-semibold text-gray-900 leading-tight flex-1 pr-2">
                                                        {service.name}
                                                    </h3>
                                                </div>

                                                <div className="mb-6">
                                                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3" title={service.description}>
                                                        {service.description}
                                                    </p>
                                                </div>

                                                <div className="space-y-4">           
                                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-700">Fixed Price</span>
                                                            <span className="text-2xl font-bold text-gray-900">
                                                                {formatCurrency(service.price)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                            </svg>
                                                            {service.duration} {service.duration > 1 ? 'hours' : 'hour'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default ManagerServices1;
