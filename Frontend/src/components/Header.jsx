import React, { useState, useEffect } from 'react';
import { Droplets, Menu, X, User, LogOut, Calendar } from 'lucide-react';
import axios from '../lib/axios';
import logo from '../assets/logo.png';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [customer, setCustomer] = useState('');
    const [islogout, setIslogout] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchCustomer = async () => {
        try {
            const response = await axios.get('/user/me', { withCredentials: true });
            setCustomer(response.data.user);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (user) fetchCustomer();
    }, [user]);

    // ✅ Define navLinks based on login status
    const navLinks = user && user.role === 'customer'
        ? [
            { label: 'My Profile', href: '/customer/dashboard' },
            { label: 'My Bookings', href: '/customer/bookings' },
            { label: 'Services', href: '/services' },
            { label: 'About Us', href: '/aboutus' },
            { label: 'FAQs', href: '/faqs' },
            { label: 'Contact Us', href: '/contactus' },
        ]
        : [
            { label: 'Services', href: '/services' },
            { label: 'About Us', href: '/aboutus' },
            { label: 'FAQs', href: '/faqs' },
            { label: 'Contact Us', href: '/contactus' },
        ];

    return (
        <>
            <header className="bg-gray-50 backdrop-blur-md shadow-sm fixed top-0 w-full z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-around items-center h-full overflow-hidden">
                        {/* Logo */}
                        <Link to="/home" className="flex items-center space-x-2">
                            <img src={logo} alt="Logo" className="h-20 max-h-full object-contain" />
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex justify-center items-center gap-10">
                            {navLinks.map(({ label, href }) => {
                                const isActive = location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
                                return (
                                    <Link
                                        key={label}
                                        to={href}
                                        className={`text-gray-700 transition-colors hover:text-green-600 ${
                                            isActive ? 'border-b-2 border-green-600 text-green-600 font-semibold' : ''
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* Right side */}
                        {user && user.role === 'customer' ? (
                            <div className="flex justify-center items-center gap-3">
                                <div className="flex items-center gap-2 py-2 px-4 bg-gray-100 rounded-full">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-gray-700 font-medium hidden sm:block">
                                        {customer.fullname || 'Customer'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIslogout(true)}
                                    className="flex items-center justify-center text-red-700 hover:text-red-900 ease-in-out duration-300 font-medium cursor-pointer"
                                >
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/signup"
                                className="py-3 px-10 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 ease-in-out duration-300 uppercase font-medium"
                            >
                                Signup
                            </Link>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-4 py-2 space-y-2">
                            {navLinks.map(({ label, href }) => (
                                <Link key={label} to={href} className="block py-2 text-gray-700 hover:text-green-600">
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {/* Logout Modal */}
            {islogout && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50 transition-opacity duration-300">
                    <div className="bg-white p-8 rounded-md shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <LogOut className="w-8 h-8 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h2>
                            <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
                        </div>

                        <div className="flex justify-center items-center gap-2">
                            <button
                                onClick={() => setIslogout(false)}
                                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm font-medium transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    logout();
                                    setIslogout(false);
                                    navigate('/home');
                                }}
                                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-sm font-medium transition-colors cursor-pointer"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Header;
