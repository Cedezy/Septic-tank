import React, { useState, useEffect } from 'react';
import SidebarTech from '../../components/SidebarTech';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import {
    Mail, User, Lock, ShieldCheck,
    Settings, Edit, Phone, MapPin, Calendar, X, ChevronLeft
} from 'lucide-react';
import { Eye, EyeOff } from "lucide-react";
import { formatDate } from '../../utils/FormatDate';
import { Link } from 'react-router-dom';

const TechAccount = () => {
    const [customerId, setCustomerId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        province: 'Zamboanga del Sur',
        city: '',
        barangay: '',
        street: '',
        birthdate: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });


    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await axios.get('/user/me', {
                    withCredentials: true
                });
                const user = response.data.user;
                setFormData(prev => ({
                    ...prev,
                    fullname: user.fullname || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    province: user.province || 'Zamboanga del Sur',
                    city: user.city || '',
                    barangay: user.barangay || '',
                    street: user.street || '',
                    birthdate: user.birthdate ? user.birthdate.split('T')[0] : ''
                }));
                setCustomerId(user._id);
            } catch (err) {
                console.error('Error fetching user data:', err);
            }
        };
        fetchCustomer();
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try{
            const response = await axios.put(`/user/update-account/${customerId}`, {
                fullname: formData.fullname,
                email: formData.email,
                phone: formData.phone,
                province: formData.province,
                city: formData.city,
                barangay: formData.barangay,
                street: formData.street,
                birthdate: formData.birthdate
            }, {
                withCredentials: true
            });
            toast.success(response.data.message);
            setShowEditModal(false);
        } 
        catch(err){
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } 
        finally{
            setIsSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if(!formData.currentPassword){
            newErrors.currentPassword = 'Current password is required';
        }

        if(!formData.newPassword){
            newErrors.newPassword = 'New password is required';
        } 
        else if(formData.newPassword.length < 6){
            newErrors.newPassword = 'Must be at least 6 characters';
        }

        if(formData.newPassword !== formData.confirmPassword){
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        if(Object.keys(newErrors).length > 0) return;

        setIsSubmitting(true);
        try{
            const response = await axios.put(`/user/update-account/${customerId}`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword }, {
                withCredentials: true
            });
            toast.success(response.data.message);
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
            setShowPasswordModal(false);
        }
        catch(err){
            toast.error(err.response?.data?.message);
            console.log(err);
        } 
        finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SidebarTech>
            <div className="min-h-screen flex">
                <div className='w-full'>
                    <div className='max-w-6xl mx-auto'> 
                        <div className="py-4">
                            <div className="pl-6 mb-4">
                                <div className='leading-4'>
                                    <h1 className="text-xl md:text-3xl uppercase font-medium tracking-wider text-gray-700">Account Settings</h1>
                                    <p className="text-gray-600 text-sm">View and manage your account information</p>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden mb-6">
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-md font-semibold text-gray-900">Profile Information</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">Your personal account details</p>
                                        </div>
                                        <button
                                            onClick={() => setShowEditModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-sm cursor-pointer ease-in-out duration-300 text-sm"
                                        >
                                            <Edit className="w-4 h-4 mr-2" />
                                            Edit Profile
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 border border-green-300 rounded-lg flex items-center justify-center mt-0.5">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                                <p className="text-base font-semibold text-gray-900">{formData.fullname || 'Not set'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 border border-green-300 rounded-lg flex items-center justify-center mt-0.5">
                                                <Mail className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Email Address</p>
                                                <p className="text-base font-semibold text-gray-900">{formData.email || 'Not set'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 border border-green-300 rounded-lg flex items-center justify-center mt-0.5">
                                                <Phone className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                                <p className="text-base font-semibold text-gray-900">{formData.phone || 'Not set'}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 border border-green-300 rounded-lg flex items-center justify-center mt-0.5">
                                                <Calendar className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Birth Date</p>
                                                <p className="text-base font-semibold text-gray-900">{formatDate(formData.birthdate)}</p>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 flex items-start space-x-3">
                                            <div className="w-8 h-8 border border-green-300 rounded-lg flex items-center justify-center mt-0.5">
                                                <MapPin className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-500">Complete Address</p>
                                                <p className="text-base font-semibold text-gray-900">
                                                    {[formData.street, formData.barangay, formData.city, formData.province]
                                                        .filter(Boolean)
                                                        .join(', ') || 'Not set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-50 to-red-100/50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className='leading-4'>
                                            <h2 className="text-md font-semibold text-gray-900">Password & Security</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">Manage your account security</p>
                                        </div>
                                        <button
                                            onClick={() => setShowPasswordModal(true)}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-sm cursor-pointer transition-colors duration-200 shadow-lg hover:shadow-xl text-sm"
                                        >
                                            <Lock className="w-4 h-4 mr-2" />
                                            Change Password
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mt-0.5">
                                            <ShieldCheck className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500">Password</p>
                                            <p className="text-base font-semibold text-gray-900">••••••••</p>
                                            <p className="text-sm text-gray-500">Manage your password</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showEditModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-3xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <Edit className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Edit Profile Information</h3>
                                            <p className="text-sm text-gray-300">Update your personal details</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="text-gray-300 hover:text-white hover:bg-green-500 rounded-full p-2 transition-all duration-200 cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto flex-1">
                                <form onSubmit={handleUpdateProfile} className="space-y-5">
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">Personal Details</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-100 cursor-not-allowed"
                                                    value={formData.fullname}
                                                    onChange={(e) => handleInputChange('fullname', e.target.value)}
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-100 cursor-not-allowed"
                                                    value={formData.email}
                                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Phone Number</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                                    value={formData.phone}
                                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Birth Date</label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-100 cursor-not-allowed"
                                                    value={formData.birthdate}
                                                    onChange={(e) => handleInputChange('birthdate', e.target.value)}
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center mb-4">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            <h4 className="text-sm font-semibold text-gray-700 uppercase">Address Information</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Province</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg bg-gray-50"
                                                    value={formData.province}
                                                    disabled
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">City</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                                    value={formData.city}
                                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Barangay</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                                    value={formData.barangay}
                                                    onChange={(e) => handleInputChange('barangay', e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Street</label>
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200"
                                                    value={formData.street}
                                                    onChange={(e) => handleInputChange('street', e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 text-sm"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <div className="bg-white rounded-sm shadow-2xl w-full max-w-md animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                            <Lock className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">Change Password</h3>
                                            <p className="text-sm text-gray-300">Update your account security</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="text-gray-300 hover:text-white hover:bg-green-500 rounded-full p-2 transition-all duration-200 cursor-pointer">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-6 py-6 overflow-y-auto flex-1">
                                <form onSubmit={handleChangePassword} className="space-y-5">
                                    <div className="relative">
                                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                            Current Password
                                        </label>
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            className={`w-full px-4 py-3 border-2 rounded-lg pr-12 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                            errors.currentPassword
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                : "border-gray-200 focus:border-red-500 focus:ring-red-200 text-sm"
                                            }`}
                                            value={formData.currentPassword}
                                            placeholder="Enter your current password"
                                            onChange={(e) =>
                                                handleInputChange("currentPassword", e.target.value)
                                            }
                                            disabled={isSubmitting}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPasswords({ ...showPasswords, current: !showPasswords.current })
                                            }
                                            className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 cursor-pointer"
                                        >
                                            {showPasswords.current ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                        {errors.currentPassword && (
                                            <p className="text-red-600 text-sm">{errors.currentPassword}</p>
                                        )}
                                    </div>
                                        <div className="relative">
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                New Password
                                            </label>
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                className={`w-full px-4 py-3 border-2 rounded-lg pr-12 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                    errors.newPassword
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-200 focus:border-red-500 focus:ring-red-200 text-sm"
                                                }`}
                                                value={formData.newPassword}
                                                placeholder="Enter new password"
                                                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                                                }
                                                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                >
                                                {showPasswords.new ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                            {errors.newPassword && (
                                                <p className="text-red-600 text-sm">{errors.newPassword}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="relative">
                                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                                Confirm Password
                                            </label>
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                className={`w-full px-4 py-3 border-2 rounded-lg pr-12 focus:outline-none focus:ring-2 transition-all duration-200 ${
                                                    errors.confirmPassword
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-200 focus:border-red-500 focus:ring-red-200 text-sm"
                                                }`}
                                                value={formData.confirmPassword}
                                                placeholder="Confirm new password"
                                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                                disabled={isSubmitting}
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswords({
                                                    ...showPasswords,
                                                    confirm: !showPasswords.confirm,
                                                    })
                                                }
                                                className="absolute right-3 top-10 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                >
                                                {showPasswords.confirm ? (
                                                    <EyeOff className="w-5 h-5" />
                                                ) : (
                                                    <Eye className="w-5 h-5" />
                                                )}
                                            </button>
                                            {errors.confirmPassword && (
                                                <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
                                            )}
                                        </div>
                                    
                                </form>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-green-500 text-white rounded-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 text-sm"
                                    >
                                        {isSubmitting ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarTech>
    );
};

export default TechAccount;