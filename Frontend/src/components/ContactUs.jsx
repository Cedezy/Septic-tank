import React, { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { Phone, Mail, MapPin, Send, User, MessageCircle } from 'lucide-react';
import Loading from './Loading';

const ContactUs = () => {
    const [contactInfo, setContactInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchContactInfo = async () => {
        try{
            const response = await axios.get('/contact');
            setContactInfo(response.data.contact[0]); 
        } 
        catch(err){
            console.error(err);
        }
        finally{
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContactInfo();
    }, []);


     if(loading){
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Loading/>
            </div>
        );
    }

    return (
        <div className='py-30'>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 max-w-4xl mx-auto px-4">
                        <h2 className="text-4xl md:text-5xl text-gray-800 uppercase tracking-tight mb-4">
                            Get in touch
                        </h2>
                        <p className="text-s, text-gray-600 leading-relaxed">
                            Need reliable septic or grease trap services? Our expert team is ready to assist with fast, safe, and affordable solutions. Reach out today and let’s keep your system running smoothly.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center mx-auto max-w-7xl gap-20">
                    <div className='flex justify-center items-center'>
                        {contactInfo && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"> 
                                <div className='flex flex-col justify-center items-center text-center gap-2 shadow-sm p-4 lg:w-sm bg-white'>
                                    <span className='text-green-600 p-2 rounded-md'><Phone className='h-10 w-10'/></span>
                                    <p className='uppercase font-semibold'>Call Us</p>
                                    <p>Need help fast? Call us for immediate, expert service now.</p>
                                    <span className='text-green-700 text-sm'>{contactInfo.phone}</span>
                                </div>
                                 <div className='flex flex-col justify-center items-center text-center gap-2 shadow-sm p-4 lg:w-sm bg-white'>
                                    <span className='text-green-600 p-2 rounded-md'><Mail className='h-10 w-10'/></span>
                                    <p className='uppercase font-semibold'>Message Us</p>
                                    <p>Message us now for fast, expert, and reliable service today..</p>
                                    <span className='text-green-700 text-sm'>{contactInfo.email}</span>
                                </div>
                                 <div className='flex flex-col justify-center items-center text-center gap-2 shadow-sm p-4 lg:w-sm bg-white'>
                                    <span className='text-green-600 p-2 rounded-md'><MapPin className='h-10 w-10'/></span>
                                    <p className='uppercase font-semibold'>Visit Us</p>
                                    <p>Need fast help? Visit us or call for expert service.</p>
                                    <span className='text-green-700 text-sm'>{contactInfo.address}</span>
                                </div>
                            </div>
                        )}
                        
                    </div>
                    
                </div>
            </div>
        </div>
    );
};

export default ContactUs