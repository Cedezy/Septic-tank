import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Calendar,
    Clock,
    MessageSquare,
    LogOut,
    UserCog,
    ChevronLeft,
    ChevronRight,
    Info,
    Phone
} from 'lucide-react';
import axios from '../lib/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const SidebarManager = ({ isCollapsed }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'customers', label: 'Customers', icon: Users, path: '/manager/customers' },
        { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/manager/bookings' },
        { id: 'about', label: 'About Us', icon: Info, path: '/manager/about' },
        { id: 'contact', label: 'Contact Us', icon: Phone, path: '/manager/contact' },
        { id: 'settings', label: 'My Account', icon: UserCog, path: '/manager/account' },
    ];

    const handleLogout = async () => {
        try{
            const response = await axios.post('/auth/logout', {}, { 
                withCredentials: true 
            });
            toast.success(response.data.message);
        }
        catch(err){
            console.error("Logout failed", err);
        } 
        finally{
            navigate('/staff/login');
        }
    };

    const handleLogoutConfirm = () => {
        Swal.fire({
            title: 'Sign Out',
            text: 'Are you sure you want to sign out of your account?',
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
        <div className="fixed flex h-screen bg-gray-50">
            <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'} flex flex-col`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        {!isCollapsed && (
                            <h1 className="text-md font-bold tracking-widest uppercase text-gray-800">Welcome Manager!</h1>
                        )}
                        <div className='flex justify-center items-center'>
                            <button className='flex justify-center items-center gap-2 cursor-pointer hover:text-red-800 ease-in-out duration-300' onClick={handleLogoutConfirm}>
                                <LogOut className="w-4 h-4" />
                                Signout
                            </button>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-auto">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        const isHovered = hoveredItem === item.id;

                        return (
                            <Link
                                key={item.id}
                                to={item.path}
                                onMouseEnter={() => setHoveredItem(item.id)}
                                onMouseLeave={() => setHoveredItem(null)}
                                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden
                                ${isActive
                                    ? 'bg-green-500 text-white shadow-lg transform scale-105'
                                    : isHovered
                                    ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 transform scale-102 shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50'}
                                `}
                                style={{
                                    transitionDelay: `${index * 25}ms`
                                }}>
                                <div className={`absolute inset-0 bg-green-500 opacity-0 transition-opacity duration-300 ${isHovered && !isActive ? 'opacity-5' : ''}`} />
                                
                                <Icon className={`w-5 h-5 transition-all duration-300 relative z-10 ${
                                    isActive 
                                        ? 'text-white transform rotate-3' 
                                        : isHovered 
                                        ? 'text-gray-700 transform scale-110' 
                                        : 'text-gray-500'
                                }`} />
        
                                {!isCollapsed && (
                                    <span className={`text-sm font-medium transition-all ease-in-out duration-300 relative z-10 ${
                                        isActive 
                                            ? 'text-white' 
                                            : isHovered 
                                            ? 'text-gray-900' 
                                            : 'text-gray-700'
                                    }`}>
                                        {item.label}
                                    </span>
                                )}

                                {isActive && (
                                    <div className="absolute right-0 top-0 h-full w-1 bg-white rounded-l-full opacity-30" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default SidebarManager;