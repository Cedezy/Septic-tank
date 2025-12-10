import React, { useState } from 'react';
import axios from '../../lib/axios';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../helpers/helpersform';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import GradientButton from '../../components/GradientButton';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png'

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
        <div className="min-h-screen flex items-center justify-center px-6 py-8 relative">
            
            <button type="button"
                onClick={() => navigate(-1)}
                className="absolute left-4 top-4 text-gray-600 hover:text-gray-800 flex items-center gap-1 sm:left-6 sm:top-6">
                <span className="text-xl">←</span>
                <span className="text-sm font-medium">Back</span>
            </button>

            <div className="w-full max-w-sm space-y-6 text-center">
                <img 
                    src={logo} 
                    alt="Logo" 
                    className="h-28 w-auto mx-auto object-contain"
                />
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 tracking-tight">
                    LOGIN HERE!
                </h2>
                <form className="space-y-4 text-left" onSubmit={handleSubmit}>
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
                                className="w-full px-4 py-3 pl-9 text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div>
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
                                className="w-full px-4 py-3 pl-9 text-sm border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(prev => !prev)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-gray-700 hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <GradientButton
                        type="submit"
                        isLoading={isLoading}
                        text="Sign In"
                        loadingText="Signing In..."
                    />
                </form>
            </div>
        </div>
    );
};

export default LoginCustomer;
