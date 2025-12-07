import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../lib/axios';
import { Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify';
import GradientButton from '../../components/GradientButton';
import logo from '../../assets/logo.png';

const LoginStaff = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (password.trim() === "") {
            toast.error("Password is required");
            return;
        }

        setIsLoading(true);
        try{
            const response = await axios.post('/auth/login', {
                email: email,
                password: password
            }, { withCredentials: true });

            const { user } = response.data;
            const allowedRoles = ['admin', 'technician', 'manager'];
            if (!allowedRoles.includes(user.role)) {
                setIsLoading(false);
                toast.error('Access denied for this login type!');
                setEmail('');
                setPassword('');
                return;
            }
   
            setTimeout(() => {
                if(user.role === 'admin'){
                    navigate('/admin/dashboard');
                }
                else if(user.role === 'technician'){
                    navigate('/technician/dashboard');
                }
                else if(user.role === 'manager'){
                    navigate('/manager/dashboard');
                }
                else{
                    alert('Invalid credentials');
                }
            }, 2000);
            toast.success(response.data.message);
        }
        catch(err){
            if(err.response?.status === 403){
                toast.error(err.response?.data?.message);
            } 
            else{
                toast.error(err.response?.data?.message);
            }
            setEmail('');
            setPassword('');
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen relative overflow-hidden bg-cover bg-center">
            <div className="flex items-center justify-center h-full p-4 relative z-10">
                <div className="w-full max-w-md">
                    <div className="rounded-md p-8 shadow-lg bg-white mt-5">
                        <div className="text-center mb-6">
                            <div className="flex flex-col justify-center items-center gap-2">
                                <img className='object-contain h-32' src={logo} alt="" />
                                <h1 className="text-3xl font-bold text-gray-700">RMG LOGIN</h1>
                            </div>
                            <p className="text-gray-600 tex-sm">Please sign in to continue</p>
                        </div>
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-800">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-4 py-3 text-sm bg-white/5 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-800">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-400 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-12 pr-12 py-3 text-sm bg-white/5 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 transition-colors cursor-pointer">
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                <Link to='/forgot-password' className='flex justify-end cursor-pointer'>
                                    <span className='text-sm hover:underline'>Forgot Password?</span>
                                </Link>
                            </div>
                            <GradientButton
                                type="submit"
                                isLoading={isLoading}
                                text="Sign In"
                                loadingText="Signing In..."
                            />
                        </form>
                        <div className="mt-6 text-center">
                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-800">
                                <Sparkles className="w-4 h-4" />
                                <span>Secure & Encrypted Connection</span>
                            </div>
                        </div>
                    </div>
                   
                </div>
            </div>
        </div>
    );
};

export default LoginStaff;