import React, { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { toast } from 'react-toastify';
import { HelpCircle } from 'lucide-react';
import { formatDate } from '../../utils/FormatDate'

const AdminFAQs = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [form, setForm] = useState({ question: '', answer: '' });
    const [editId, setEditId] = useState(null);
    const [selectedFaqs, setSelectedFaqs] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!form.question || !form.answer)return;

        try{
            if(editId){
                const response = await axios.put(`/faqs/${editId}`, form, { 
                    withCredentials: true 
                });
                toast.success(response.data.message);
            } 
            else{
                const response = await axios.post('/faqs', form, { 
                    withCredentials: true 
                });
                toast.success(response.data.message);
            }
            setForm({ question: '', answer: '' });
            setEditId(null);
            setShowModal(false);
            fetchFaqs();
            setSelectedFaqs(null);
        } 
        catch(err){
            console.error(err);
        }
    };

    const handleEdit = (faq) => {
        setForm({ question: faq.question, answer: faq.answer });
        setEditId(faq._id);
        setShowModal(true);
    };

    return (
        <div className="h-screen flex overflow-hidden">
            <div className='w-full'>
                <HeaderAdmin />
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='px-6 pb-4 flex flex-col gap-5 h-screen pt-40'>
                        <div className='flex justify-between items-center'>
                            <span className='text-2xl tracking-tighter font-medium text-gray-700'>
                                MANAGE FAQs
                            </span>
                            <div className='flex gap-2'>
                                <button 
                                    title="Edit FAQs"
                                    onClick={() => handleEdit(selectedFaqs)}
                                    disabled={!selectedFaqs}
                                    className="px-6 py-2.5 rounded-sm bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-bold text-sm cursor-pointer">
                                    EDIT
                                </button>
                                <button onClick={() => setShowModal(true)}
                                className="px-6 py-2.5 rounded-sm bg-green-500 hover:bg-green-600 text-white ease-in-out duration-200 shadow-sm hover:shadow-md font-bold text-sm cursor-pointer">
                                    ADD FAQs
                                </button>
                            </div>
                            
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
                                            <tr key={faq._id}
                                                onClick={() => setSelectedFaqs(faq)}
                                                className={`cursor-pointer transition ${selectedFaqs?._id === faq._id ? 'bg-green-100' : 'hover:bg-gray-100 ease-in-out duration-300'
                                            }`}>
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
                
                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                            <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                                <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white">
                                                {editId ? 'Edit FAQ Item' : 'Create New FAQ'}
                                            </h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-6 overflow-y-auto flex-1">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">1</span>
                                                FAQ Question
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 text-sm rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    placeholder="Enter frequently asked question..."
                                                    value={form.question}
                                                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Clear and concise question that users commonly ask</p>
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">2</span>
                                                FAQ Answer
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <textarea
                                                    required
                                                    rows={5}
                                                    className="w-full text-sm pl-4 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 resize-none text-gray-800"
                                                    placeholder="Provide a comprehensive answer..."
                                                    value={form.answer}
                                                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-xs text-gray-500">Detailed and helpful answer to address user concerns</p>
                                                <p className="text-xs text-gray-400">{form.answer.length} characters</p>
                                            </div>
                                        </div>
                                    </form>
                                </div>

                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs text-gray-500">
                                            {editId ? 'Update existing FAQ item' : 'Create new FAQ entry'}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowModal(false)
                                                    setSelectedFaqs(null)
                                                }}
                                                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                onClick={handleSubmit}
                                                className="px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer text-sm"
                                            >
                                                {editId ? 'Update FAQ' : 'Create FAQ'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFAQs;