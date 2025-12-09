import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { ChevronDown, ChevronUp, Search, HelpCircle, Sparkles } from 'lucide-react';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useNavigate } from 'react-router-dom';

const FAQs = () => {
    const [faqs, setFaqs] = useState([]);
    const [activeIndex, setActiveIndex] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchFaqs = async () => {
            try{
                const response = await axios.get('/faqs');
                setFaqs(response.data.faqs);
            } 
            catch(err){
                console.error(err);
            }
            finally{
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    if(loading){
        return (
            <div className='min-h-screen bg-gray-50'>
                <Header/>
                 <div className='flex items-center justify-center min-h-screen'>
                    <Loading/>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <Header/>
            <div className='pt-28'>
                 <div className="max-w-7xl mx-auto space-y-4">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-800 flex items-center gap-1 ml-6"
                        >
                        <span className="text-xl">←</span>
                        <span className="text-md font-medium">Back</span>
                    </button>
                    <div className="text-center mb-16 max-w-4xl mx-auto px-4">
                        <h2 className="text-4xl md:text-5xl text-gray-800 uppercase tracking-tight mb-4">
                            frequently asked questions
                        </h2>
                        <p className="text-s, text-gray-600 leading-relaxed">
                            Our expert team is here to help with fast, safe, and affordable solutions. Browse through our FAQs below — or reach out today and let’s keep your system running smoothly.
                        </p>
                    </div>
                </div>
            </div>
        
            <div className="max-w-4xl mx-auto px-4 pb-20">
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div 
                            key={index} 
                            className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                                activeIndex === index ? 'ring-2 ring-green-500/20 shadow-lg' : ''
                            }`}>
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex justify-between items-center p-6 text-left transition-all duration-200 hover:bg-gray-50/80 group-hover:bg-gray-50/50 cursor-pointer">
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                        activeIndex === index 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                    }`}>
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-gray-800 text-lg leading-relaxed pr-4">
                                        {faq.question}
                                    </span>
                                </div>
                                <div className={`flex-shrink-0 transition-all duration-200 ${
                                    activeIndex === index ? 'text-green-500' : 'text-gray-400'
                                }`}>
                                    {activeIndex === index ? 
                                        <ChevronUp className="w-5 h-5" /> : 
                                        <ChevronDown className="w-5 h-5" />
                                    }
                                </div>
                            </button>
                            
                            <div className={`transition-all duration-300 ease-in-out ${
                                activeIndex === index 
                                    ? 'max-h-96 opacity-100' 
                                    : 'max-h-0 opacity-0'
                            }`}>
                                <div className="px-6 pb-6">
                                    <div className="ml-12 p-4 bg-gradient-to-r from-green-50 to-purple-50 rounded-lg border-l-4 border-green-400">
                                        <p className="text-gray-700 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-green-50 border-t border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                            Still have questions?
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Can't find the answer you're looking for? Our support team is here to help you get the information you need.
                        </p>
                        <Link to='/contactus'>
                            <button className="inline-flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-sm font-medium transition-all duration-200 hover:bg-green-600 transform cursor-pointer">
                                <HelpCircle className="w-5 h-5" />
                                Contact Support
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQs;