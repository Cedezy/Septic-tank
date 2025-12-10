import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import SidebarManager from '../../components/SidebarManager';
import HeaderAdmin from '../../components/HeaderAdmin';
import { HelpCircle } from 'lucide-react';
import { formatDate } from '../../utils/FormatDate'

const ManagerFAQs = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [faqs, setFaqs] = useState([]);

    const fetchFaqs = async () => {
        try{
            const response = await axios.get('/faqs', { 
                withCredentials: true 
            });
            setFaqs(response.data.faqs);
        } 
        catch(err){
            console.error(err);
        }
    };

    useEffect(() => { 
        fetchFaqs(); 
    }, []);

    return (
        <div className="h-screen flex overflow-hidden">
            <div className='w-full'>
                <HeaderAdmin />
                <SidebarManager isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='px-6 pb-4 flex flex-col gap-5 h-screen pt-40'>
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter font-medium text-gray-700'>
                                FAQs
                            </span> 
                        </div>
                        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-y-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Answer</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posted on</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {faqs.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-16">
                                                <div className="flex flex-col items-center">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                        <HelpCircle className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
                                                    <p className="text-gray-500">Create some common questions to help your users.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        faqs.map((faq) => (
                                            <tr key={faq._id}>
                                                <td className="px-6 py-6 text-sm">{faq.question}</td>
                                                <td className="px-6 py-4 text-sm">{faq.answer}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(faq.createdAt)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerFAQs;