import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    UserCheck,
    Calendar,
    Clock,
    MessageSquare,
    HelpCircle,
    Settings,
    ChevronLeft,
    Wrench,
    ChevronDown,
    Phone,
    Info,
    UserCog,
    LogOut
} from 'lucide-react';
import axios from '../lib/axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const SidebarAdmin = ({ isCollapsed }) => {
    const [expandedSubmenu, setExpandedSubmenu] = useState(null);
    const [hoveredItem, setHoveredItem] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'user-accounts', label: 'Registered User', icon: UserCheck, path: '/admin/users' },
        { id: 'customers', label: 'Customers', icon: Users, path: '/admin/customers' },
        { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/admin/bookings' },
        { id: 'services1', label: 'Services', icon: Wrench, path: '/admin/services1' },
        { id: 'about', label: 'About Us', icon: Info, path: '/admin/about' },
        { id: 'contact', label: 'Contact Us', icon: Phone, path: '/admin/contact' },
        { id: 'faqs', label: 'FAQs', icon: HelpCircle, path: '/admin/faqs' },
        {
            id: 'acc-settings',
            label: 'Account Settings',
            icon: UserCog,
            hasSubmenu: true,
            submenu: [
                { label: 'My Account', path: '/admin/account-settings' },
                { label: 'User Accounts', path: '/admin/user-accounts' },
            ],
        },
        {
            id: 'sys-settings',
            label: 'System Settings',
            icon: Settings,
            hasSubmenu: true,
            submenu: [
                { label: 'Services', path: '/admin/services' },
                { label: 'Gallery', path: '/admin/gallery' },
            ],
        },
    ];

    const isSubmenuActive = (submenu) => {
        return submenu.some(item => location.pathname === item.path);
    };

    const toggleSubmenu = (itemId) => {
        if (isCollapsed) return;
        setExpandedSubmenu(expandedSubmenu === itemId ? null : itemId);
    };

    useEffect(() => {
        menuItems.forEach(item => {
            if (item.hasSubmenu && isSubmenuActive(item.submenu)) {
                setExpandedSubmenu(item.id);
            }
        });
    }, [location.pathname]);

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
        <div className="fixed top-[150px] left-0 h-[calc(100vh-144px)] flex bg-gray-50 z-40">
            <div className={`bg-white shadow-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-72'} flex flex-col`}>
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        {!isCollapsed && (
                            <h1 className="text-xl font-bold tracking-widest uppercase text-gray-800">Welcome Admin!</h1>
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
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.path ? location.pathname === item.path : false;
                        const isSubmenuItemActive = item.hasSubmenu ? isSubmenuActive(item.submenu) : false;
                        const isExpanded = expandedSubmenu === item.id;
                        const isHovered = hoveredItem === item.id;

                        return (
                            <div key={item.id} className="relative">
                                {item.hasSubmenu ? (
                                    <button
                                        onClick={() => toggleSubmenu(item.id)}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden
                                        ${isSubmenuItemActive ? 'bg-green-500 text-white shadow-lg transform scale-105'
                                            : isHovered ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 transform scale-102 shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <div className={`absolute inset-0 bg-green-500 opacity-0 transition-opacity duration-300 ${isHovered && !isSubmenuItemActive ? 'opacity-5' : ''}`} />
                                        <div className="flex items-center space-x-3 relative z-10">
                                            <Icon className={`w-5 h-5 transition-all duration-300 ${isSubmenuItemActive ? 'text-white transform rotate-3' : isHovered ? 'text-gray-700 transform scale-110' : 'text-gray-500'}`} />
                                            {!isCollapsed && (
                                                <span className={`text-sm font-medium transition-all duration-300 ${isSubmenuItemActive ? 'text-white' : isHovered ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>
                                        {!isCollapsed && (
                                            <div className="flex items-center space-x-2 relative z-10">
                                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'} ${isSubmenuItemActive ? 'text-white' : isHovered ? 'text-gray-700' : 'text-gray-500'}`} />
                                            </div>
                                        )}
                                    </button>
                                ) : (
                                    <Link to={item.path}
                                        onMouseEnter={() => setHoveredItem(item.id)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-300 ease-out group relative overflow-hidden
                                        ${isActive ? 'bg-green-500 text-white shadow-lg transform scale-105'
                                            : isHovered ? 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-900 transform scale-102 shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <div className={`absolute inset-0 bg-green-500 opacity-0 transition-opacity duration-300 ${isHovered && !isActive ? 'opacity-5' : ''}`} />
                                        <div className="flex items-center space-x-3 relative z-10">
                                            <Icon className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-white transform rotate-3' : isHovered ? 'text-gray-700 transform scale-110' : 'text-gray-500'}`} />
                                            {!isCollapsed && (
                                                <span className={`text-sm font-medium transition-all duration-300 ${isActive ? 'text-white' : isHovered ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {item.label}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                )}

                                {item.hasSubmenu && (
                                    <div className={`ml-6 overflow-hidden transition-all duration-500 ease-out ${isExpanded && !isCollapsed ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                                        <div className="space-y-1 pb-2">
                                            {item.submenu.map((subItem, index) => {
                                                const isSubActive = location.pathname === subItem.path;
                                                return (
                                                    <Link
                                                        key={index}
                                                        to={subItem.path}
                                                        className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-300 ease-out transform hover:scale-105 hover:shadow-sm
                                                        ${isSubActive ? 'bg-gradient-to-r from-green-50 to-purple-50 text-green-700 font-medium border-l-4 border-green-500 shadow-sm'
                                                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:text-gray-900 hover:border-l-4 hover:border-transparent'}`}
                                                        style={{ transitionDelay: `${index * 50}ms` }}>
                                                        {subItem.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};

export default SidebarAdmin;
