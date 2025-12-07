import React, { useState, useEffect } from 'react';
import {
  Users,
  Phone,
  Info,
  UserCog,
  LogOut,
  Menu,
  X,
  Wrench
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const SidebarTech = ({ children }) => {
    const [technician, setTechnician] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'services', label: 'Services', icon: Wrench, path: '/technician/services' },
        { id: 'schedule', label: 'My Bookings', icon: Users, path: '/technician/schedule' },
        { id: 'about', label: 'About Us', icon: Info, path: '/technician/about' },
        { id: 'contact', label: 'Contact Us', icon: Phone, path: '/technician/contact' },
        { id: 'profile', label: 'My Account', icon: UserCog, path: '/technician/account' },
    ];

    useEffect(() => {
        fetchTechnicianData();
    }, []);

    const fetchTechnicianData = async () => {
        try {
        const response = await axios.get('/user/me', { withCredentials: true });
        setTechnician(response.data.user);
        } catch (err) {
        console.error(err);
        }
    };

    const handleLogout = async () => {
        try {
        const response = await axios.post('/auth/logout', {}, { withCredentials: true });
        toast.success(response.data.message);
        } catch (err) {
        console.error("Logout failed", err);
        } finally {
        setTechnician(null);
        navigate('/staff/login');
        }
    };

    const handleLogoutConfirm = () => {
        Swal.fire({
        title: 'Sign Out',
        text: 'Are you sure you want to sign out?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sign Out',
        cancelButtonText: 'Cancel',
        }).then((result) => {
        if (result.isConfirmed) {
            handleLogout();
        }
        });
    };

    return (
        <div className="h-screen">
            {/* Header with Hamburger */}
            <div className="fixed top-0 left-0 w-full bg-green-600 text-white p-4 flex items-center justify-between gap-2 shadow-lg z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
                <h1 className="text-lg font-medium uppercase tracking-wider leading-5">RMG SEPTIC TANK CLEANING SERVICES</h1>
                <div className="w-10"></div>
            </div>

            {/* Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Close Button */}
                    <div className="flex items-center justify-end p-4 border-b border-gray-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Welcome Section */}
                    {technician && (
                        <div className="p-4 bg-green-50 border-b border-gray-200">
                            <p className="text-sm text-gray-500">Welcome,</p>
                            <p className="text-lg font-semibold text-gray-800">{technician.fullname}</p>
                        </div>
                    )}

                    {/* Sign Out Button */}
                    <div className="p-4 border-b border-gray-200">
                        <button
                            onClick={handleLogoutConfirm}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4 text-red-600" />
                            <span className="font-medium text-red-600 text-sm">Sign Out</span>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex-1 overflow-y-auto p-4">
                        <div className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                                            isActive
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-green-50'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </div>
            </div>
            <div className="flex-1 px-1 pt-25">
                {children} {/* This will render TechAbout content */}
            </div>
        </div>
    );
};

export default SidebarTech;