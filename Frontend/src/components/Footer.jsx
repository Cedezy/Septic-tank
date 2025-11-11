import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../lib/axios';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Shield, 
  Award, 
} from 'lucide-react';
import logo from '../assets/logo.png';

const Footer = () => {

    const [contacts, setContacts] = useState('');

     const navLinks = [
        { label: 'Home', href: '/home' },
        { label: 'Services', href: '/services' },
        { label: 'About Us', href: '/aboutus' },
        { label: 'Reviews', href: '/reviews' },
        { label: 'FAQs', href: '/faqs' },
    ]

    useEffect(() => {
        const fetchContacts = async () => {
            try{
                const response = await axios.get('/contact');
                setContacts(response.data.contact[0]);
            }
            catch(err){
                console.log(err);
            }
        }
        fetchContacts();
    }, [])
    return (
          <footer className="bg-green-100 text-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src={logo} className="h-10 w-10 text-slate-900" alt="" />
                            <h3 className="text-xl font-bold text-slate-900">RMG Septic</h3>
                        </div>
                        <p className="text-slate-800 text-sm leading-relaxed">
                            Professional septic tank cleaning and maintenance services. Licensed, insured, and committed to keeping your system running smoothly.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-green-600">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            {navLinks.map((link, index) => (
                                <li key={index}>
                                <a 
                                    href={link.href} 
                                    className="text-slate-800 hover:text-slate-900 cursor-pointer transition-colors">
                                    {link.label}
                                </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-green-600">Contact Us</h4>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center space-x-3">
                                <Phone className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-slate-900 font-medium">{contacts.phone}</p>
                                    <p className="text-gray-600 text-xs">24/7 Emergency Line</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="h-4 w-4 text-green-600 flex-shrink-0" />
                                <p className="text-slate-800">{contacts.email}</p>
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-slate-800">{contacts.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 border-t border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-center items-center">
                        <div className="text-center md:text-left">
                            <p className="text-gray-50 text-sm">
                                © {new Date().getFullYear()} RMG Septic Services. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer


