import React, { useState } from 'react';
import axios from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../helpers/helpersform';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';

const LoginCustomer = () => {
    const { setUser } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

   const handleSubmit = async (e) => {
        e.preventDefault();
        
        if(!validateEmail(email)){
            toast.error('Please enter a valid email address!');
            setEmail('');
            setPassword('');
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.post(
                '/auth/login',
                { email, password },
                { withCredentials: true }
            );

            const { user } = response.data;

            if (user.role !== 'customer') {
                toast.warning('Access denied for this login type!');
                setEmail('');
                setPassword('');
                setIsLoading(false);
                return;
            }

            toast.success(response.data.message);
            setUser(user);
            navigate('/home');
        } catch (err) {
            toast.error(err.response?.data?.message);
            setEmail('');
            setPassword('');
            setIsLoading(false);
        }
    };

    return (
        <div className="max-h-screen z-50">
            <div className="flex justify-center items-center h-screen">
                <div className="bg-gray-300 px-5 py-4 shadow-md rounded-xl">
                    <div className="flex justify-center items-center">
                        <div className="p-10 w-sm flex flex-col gap-4">  
                            <div className='flex justify-center items-center'>
                                <h2 className='text-3xl font-bold text-gray-700 tracking-tighter'>LOGIN HERE!</h2>
                            </div>
                            <form className="space-y-4 flex flex-col" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Email</label>
                                    <div className="relative">
                                        <span className="absolute flex items-center pl-3 left-0 inset-y-0 text-gray-500">
                                            <Mail size={16} />
                                        </span>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            placeholder="Enter your email"
                                            className="w-full px-4 py-3 pl-9 text-sm border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-500 text-gray-800"
                                        />
                                    </div>
                                </div>
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-600">Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                                            <Lock size={16} />
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            placeholder="Enter your password"
                                            className="w-full px-4 py-3 pl-9 text-sm border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-500 text-gray-800"
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 cursor-pointer">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />} 
                                        </button>
                                    </div>
                                </div>
                                <div className='self-end -mt-3'>
                                    <Link to="/forgot-password" className='text-sm hover:underline cursor-pointer text-gray-700'>
                                        Forgot Password?
                                    </Link>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <GradientButton
                                        type="submit"
                                        isLoading={isLoading}
                                        text="Sign In"
                                        loadingText="Signing In..."
                                    />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default LoginCustomer;
