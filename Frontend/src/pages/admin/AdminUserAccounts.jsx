import React from 'react';
import { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import SidebarAdmin from '../../components/SidebarAdmin';
import HeaderAdmin from '../../components/HeaderAdmin';
import { formatDate } from '../../utils/FormatDate';
import { toast } from 'react-toastify';
import { 
    Users,
    Shield,
    Wrench,
    User,
    UserX,
    Mail,
    Phone,
    MapPin,
    Lock, 
    Eye,
    EyeOff,
    AlertTriangle, 
    CalendarDays 
} from 'lucide-react';

const AdminUserAccounts = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDeactivateModal, setShowDeacticateModal] = useState(false);
    const [selectedUserToDiactivate, setSelectedUserToDiactivate] = useState(null);
    const [isModalInfoOpen, setIsModalInfoOpen] = useState(false);
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        province: 'Zamboanga del Sur',
        city: '',
        barangay: '',
        street: ''
    });
   
    const fetchUsers = async () => {
        try {
            const response = await axios.get('/user', { withCredentials: true });

            const filtered = response.data.users.filter(
            (user) => user.role === 'technician' || user.role === 'manager'
            );

            setUsers(filtered);
            setFilteredUsers(filtered);
        } catch (err) {
            console.log(err);
        }
    };

     useEffect(() => {
        fetchUsers();
    }, []);

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const emptyForm = {
        fullname: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        confirmPassword: '',
        birthdate: '',
        province: 'Zamboanga del Sur',
        city: '',
        barangay: '',
        street: ''
    };

    const generatePassword = (length = 10) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const openAddModal = () => {
        const newPassword = generatePassword();
        setEditingId(null);
        setFormData({
            ...emptyForm,
            password: newPassword,
            confirmPassword: newPassword
        });
        setIsModalOpen(true);
    };


    const openEditModal = (user) => {
        setEditingId(user._id);
        setFormData({
            fullname: user.fullname || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || '',
            password: '',
            confirmPassword: '',
            birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split("T")[0] : '',
            province: user.province || 'Zamboanga del Sur',
            city: user.city || '',
            barangay: user.barangay || '',
            street: user.street || ''
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try{
            const dataToSubmit = { ...formData };

            if(editingId) {
                const response = await axios.put(`/user/${editingId}`, dataToSubmit, { 
                    withCredentials: true
                });
                toast.success(response.data.message);
            } 
            else{
                const response = await axios.post('/user', dataToSubmit, { 
                    withCredentials: true
                });
                toast.success(response.data.message);
            }
            setIsModalOpen(false);
            setFormData(emptyForm);
            setEditingId(null);
            fetchUsers();
        } 
        catch(err){
            toast.error(err.response?.data?.message);
        }
    }; 

    const handleDeactivate  = async (id) => {
        try{
            const response = await axios.put(`/user/deactivate/${id}`, {}, {
                withCredentials: true
            });
            toast.success(response.data.message);
            fetchUsers();
        } 
        catch(err){
            if(err.response && err.response.data && err.response.data.message) {
                toast.error(err.response.data.message); 
            } 
            else{
                toast.error("Failed to deactivate user.");
            }
        }
    };

    const handleReactivate = async (id) => {
        try {
            const response = await axios.put(
                `/user/reactivate/${id}`,
                {},
                { withCredentials: true }
            );

            // Show success message
            toast.success(response.data.message);

            // Refresh user list
            fetchUsers();

        } catch (err) {
            // Show error message
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Failed to reactivate user.");
            }
        }
    };


    const closeDeactivateModal = () => {
        setShowDeacticateModal(false)
    }

    const openDeactivateModal = (user) => {
        setSelectedUserToDiactivate(user);
        setShowDeacticateModal(true);
    };

    const roles = [
        { value: 'manager', label: 'Manager', icon: Shield, color: 'bg-purple-100 text-purple-700' },
        { value: 'technician', label: 'Technician', icon: Wrench, color: 'bg-green-100 text-green-700' },
    ];

    const getRoleConfig = (role) => {
        return roles.find(r => r.value === role) || roles[2];
    };

    return (
        <div className="min-h-screen flex">
            <div className='w-full'> 
                <HeaderAdmin /> 
                <SidebarAdmin isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(prev => !prev)} />
                <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-72'}`}>
                    <div className='px-6 pb-4 flex flex-col gap-5 h-screen pt-40'> 
                        <div className='flex justify-center items-center'>
                            <span className='text-2xl tracking-tighter uppercase font-medium text-gray-700'>
                                Manage users accounts
                            </span>
                        </div>
                        <div className="bg-white rounded-sm shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Full Name
                                            </th>
                                            <th className="py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email Address
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact number
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                USER TYPE
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Registered Date
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-16">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <UserX className="w-8 h-8 text-gray-400" />                             
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet!</h3>
                                                        <p className="text-gray-500">Customers will appear here once they submit a request.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center py-16">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                            <UserX className="w-8 h-8 text-gray-400" />                             
                                                        </div>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No records found!</h3>
                                                        <p className="text-gray-500">Try adjusting your search keywords.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => {
                                                const roleConfig = getRoleConfig(user.role);
                                                const RoleIcon = roleConfig.icon;
                                                
                                                return (
                                                    <tr
                                                        key={user._id}
                                                        onClick={() => setSelectedUser(user)}
                                                        onDoubleClick={() => {
                                                            setSelectedUser(user);
                                                            setIsModalInfoOpen(true);
                                                        }}
                                                        className={`cursor-pointer transition 
                                                            ${selectedUser?._id === user._id ? 'bg-green-100' : 'hover:bg-gray-100 ease-in-out duration-300'}
                                                            ${!user.isActive ? 'opacity-50 bg-gray-200' : ''}
                                                        `}
                                                    >

                                                        <td className="px-6 py-5 text-sm font-medium text-gray-800">
                                                            {user.fullname}
                                                        </td>
                                                        <td className="text-sm font-medium text-gray-800">
                                                            {user.email}
                                                        </td>
                                                         <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                            {user.phone}
                                                        </td>
                                                        <td className="px-4 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleConfig.color}`}>
                                                                <RoleIcon className="w-3 h-3 mr-1" />
                                                                {roleConfig.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900 capitalize">
                                                            {formatDate(user.createdAt)}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-between py-4 bg-white border-t border-gray-200">
                            <div className="flex-1 flex justify-center">
                                <button
                                    onClick={openAddModal}
                                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 ease-in-out duration-300 text-white px-4 py-2 rounded-sm cursor-pointer font-bold text-sm"
                                >
                                    ADD NEW USER
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    title="Edit User"
                                    onClick={() => openEditModal(selectedUser)}
                                    disabled={!selectedUser}
                                    className="px-6 py-2.5 rounded-sm bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-bold text-sm cursor-pointer"
                                >
                                    EDIT
                                </button>

                                {/* IF ACTIVE → Show DEACTIVATE */}
                                {selectedUser?.isActive ? (
                                    <button
                                        title="Deactivate User"
                                        onClick={() => openDeactivateModal(selectedUser)}
                                        disabled={!selectedUser}
                                        className="px-6 py-2.5 rounded-sm bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-bold text-sm cursor-pointer"
                                    >
                                        DEACTIVATE
                                    </button>
                                ) : (
                                /* IF NOT ACTIVE → Show REACTIVATE */
                                    <button
                                        title="Reactivate User"
                                        onClick={() => openDeactivateModal(selectedUser)}
                                        disabled={!selectedUser}
                                        className="px-6 py-2.5 rounded-sm bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md font-bold text-sm cursor-pointer"
                                    >
                                        REACTIVATE
                                    </button>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
           
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-3xl animate-fade-in mx-auto flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="bg-green-600 px-6 py-4 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <User className="w-4 h-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white">
                                        {editingId ? "Edit User Account" : "Create New User Account"}
                                    </h3>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 overflow-y-auto flex-1">
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                {/* Personal Information Section */}
                                <div>
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Personal Information</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">1</span>
                                                Full Name
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="fullname"
                                                    type="text"
                                                    name="fullname"
                                                    placeholder="Enter full name"
                                                    value={formData.fullname}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Enter complete legal name</p>
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">2</span>
                                                Date of Birth
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <CalendarDays className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="birthdate"
                                                    type="date"
                                                    name="birthdate"
                                                    value={formData.birthdate}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Enter date of birth</p>
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">3</span>
                                                Contact Number
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="Enter contact number"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Primary contact number</p>
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">4</span>
                                                Email Address
                                                <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter email address"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Valid email for account access</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Information Section */}
                                <div>
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Address Information</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">6</span>
                                                City/Municipality
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter city"
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">City or municipality</p>
                                        </div>

                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">7</span>
                                                Barangay
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="barangay"
                                                    value={formData.barangay}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter barangay"
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Barangay or district</p>
                                        </div>

                                        <div className='col-span-2'>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">8</span>
                                                Street Address
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="street"
                                                    value={formData.street}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter street address..."
                                                    className="w-full text-sm pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Street name and number</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                        <h4 className="text-sm font-semibold text-gray-700 uppercase">Security Settings</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">9</span>
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"} // toggle type
                                                    name="password"
                                                    value={formData.password}
                                                    readOnly
                                                    className="w-full text-sm pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg 
                                                            focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 
                                                            transition-all duration-200 placeholder-gray-400 text-gray-800 bg-gray-100 cursor-not-allowed"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Automatically generated password</p>
                                        </div>
                                        <div>
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">10</span>
                                                Confirm Password
                                                {!editingId && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    placeholder={editingId ? "Confirm new password" : "Confirm password"}
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    required={!editingId}
                                                    className="w-full text-sm pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg 
                                                    focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 
                                                    transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                />
                                                <button type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700">
                                                    {showConfirmPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Must match password above</p>
                                        </div>
                                    </div>
                                </div>

                                {!editingId && (
  <div>
        <div className="flex items-center mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase">Account Permissions</h4>
        </div>
        <div>
        <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
            <span className="bg-gray-100 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-2">11</span>
            User Type
            <span className="text-red-500 ml-1">*</span>
        </label>
        <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className="w-full text-sm pl-3 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 text-gray-800"
        >
            <option value="">Select user type</option>
            <option value="manager">Manager</option>
            <option value="technician">Technician</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">Choose the account type</p>
        </div>
    </div>
)}

                            </form>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    {editingId ? 'Update existing user account' : 'Create new user account'}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 font-medium cursor-pointer text-sm"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={handleFormSubmit}
                                        className="px-6 py-2.5 bg-green-600 text-white rounded-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 font-medium shadow-lg hover:shadow-xl cursor-pointer text-sm">
                                        {editingId ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isModalInfoOpen && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                    <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in">
                    
                    {/* Header */}
                    <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                        <h3 className="text-xl font-medium text-gray-50 tracking-tight">{selectedUser.fullname}</h3>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-8 pt-6 pb-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                        <div className="space-y-4">

                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">Registration Date</span>
                            <span className="col-span-2 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">Email Address</span>
                            <span className="col-span-2 text-sm text-gray-900">{selectedUser.email}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">Contact Number</span>
                            <span className="col-span-2 text-sm text-gray-900">{selectedUser.phone}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">User Type</span>
                            <span className="col-span-2 text-sm text-gray-900 capitalize">{selectedUser.role}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 py-3 border-b border-gray-100">
                            <span className="text-sm font-medium text-gray-500">Birth Date</span>
                            <span className="col-span-2 text-sm text-gray-900">{formatDate(selectedUser.birthdate)}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-x-4 py-3">
                            <span className="text-sm font-medium text-gray-500">Complete Address</span>
                            <span className="col-span-2 text-sm text-gray-900">
                            {selectedUser.street} {selectedUser.barangay}, {selectedUser.city}, {selectedUser.province}
                            </span>
                        </div>

                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-4 py-4 flex justify-end">
                        <button
                        type="button"
                        onClick={() => {
                            setIsModalInfoOpen(false);
                            setSelectedUser(null);
                        }}
                        className="px-6 py-2 border-2 border-gray-400 text-gray-700 rounded-sm hover:border-gray-500 transition cursor-pointer text-sm"
                        >
                        Close
                        </button>
                    </div>
                    </div>
                </div>
            )}


            
            {showDeactivateModal && selectedUserToDiactivate && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-2xl max-w-md w-full animate-fade-in relative transform transition-all duration-300 scale-100 border border-gray-100">
                        
                        <div>
                            <div className="p-6 text-center">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center 
                                    ${selectedUserToDiactivate.isActive ? "bg-yellow-100" : "bg-blue-100"}`}>
                                    <AlertTriangle 
                                        className={`w-8 h-8 
                                            ${selectedUserToDiactivate.isActive ? "text-yellow-600" : "text-blue-600"}`} 
                                    />
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {selectedUserToDiactivate.isActive
                                        ? "Deactivate User Account"
                                        : "Reactivate User Account"}
                                </h3>

                                <p className="text-gray-600 mb-6">
                                    You are about to{" "}
                                    <span className="font-semibold">
                                        {selectedUserToDiactivate.isActive ? "deactivate" : "reactivate"}
                                    </span>{" "}
                                    the account for{" "}
                                    <span className="font-semibold text-gray-900">
                                        {selectedUserToDiactivate.fullname}
                                    </span>
                                </p>

                                {/* Info Box */}
                                <div className={`border rounded-lg p-4 mb-6 
                                    ${selectedUserToDiactivate.isActive 
                                        ? "bg-yellow-50 border-yellow-200" 
                                        : "bg-blue-50 border-blue-200"}`}>
                                    
                                    <div className="flex items-start space-x-3">
                                        <Shield 
                                            className={`w-5 h-5 mt-0.5 flex-shrink-0
                                                ${selectedUserToDiactivate.isActive ? "text-yellow-600" : "text-blue-600"}`} 
                                        />
                                        <div className="text-left">
                                            <h4 className={`text-sm font-medium mb-1
                                                ${selectedUserToDiactivate.isActive ? "text-yellow-800" : "text-blue-800"}`}>
                                                Please note:
                                            </h4>

                                            <ul className="text-sm space-y-1">
                                                {selectedUserToDiactivate.isActive ? (
                                                    <>
                                                        <li>• User account will be disabled</li>
                                                        <li>• User will not be able to log in</li>
                                                        <li>• You can reactivate anytime</li>
                                                    </>
                                                ) : (
                                                    <>
                                                        <li>• User account will be restored</li>
                                                        <li>• User will regain access</li>
                                                        <li>• You can deactivate anytime</li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-2 px-6 pb-6">
                                <button
                                    onClick={closeDeactivateModal}
                                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        if (selectedUserToDiactivate.isActive) {
                                            handleDeactivate(selectedUserToDiactivate._id);
                                        } else {
                                            handleReactivate(selectedUserToDiactivate._id);
                                        }
                                        closeDeactivateModal();
                                        setSelectedUser(null)
                                    }}
                                    className={`flex-1 px-4 py-2.5 text-white rounded-sm transition-colors duration-200 font-medium text-sm
                                        ${selectedUserToDiactivate.isActive 
                                            ? "bg-yellow-600 hover:bg-yellow-700"
                                            : "bg-blue-600 hover:bg-blue-700"}`}
                                >
                                    {selectedUserToDiactivate.isActive ? "Deactivate" : "Reactivate"}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}


        </div>
    );
}

export default AdminUserAccounts;