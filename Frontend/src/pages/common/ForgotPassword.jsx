import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import GradientButton from '../../components/GradientButton';
import {
    MailCheck,
    Mail,
    Loader2,
    Send,
    LockKeyhole,
    Lock,
    KeyRound,
    BadgeCheck
} from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState('email');
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const savedStep = localStorage.getItem("forgot_step");
        const savedEmail = localStorage.getItem("forgot_email");

        if (savedStep === "otp" && savedEmail) {
            setEmail(savedEmail);
            setStep("otp");
        }
    }, []);


    const handleForgotPassword = async (e) => {
        e.preventDefault();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email.trim())) {
            toast.error("Please enter a valid email address");
            return;
        }
        setIsLoading(true);
        try{
            const response = await axios.post('/auth/forgot-password', { email });
            toast.success(response.data.message);

            localStorage.setItem("forgot_step", "otp");
            localStorage.setItem("forgot_email", email);

            setStep('otp');

        } 
        catch(err){
            toast.error(err.response?.data?.message);
        } 
        finally{
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(newPassword !== confirmPassword){
            toast.error('Passwords do not match!');
            return;
        }

        try{
            const response = await axios.post('/auth/reset-password', {
                email,
                resetOtp: otp,
                newPassword,
            });

            const role = response.data.role;

            toast.success(response.data.message);

localStorage.removeItem("forgot_step");
localStorage.removeItem("forgot_email");

setEmail('');
setOtp('');
setNewPassword('');
setConfirmPassword('');

navigate(role === 'customer' ? '/home' : '/staff/login');

        } 
        catch(err){
            toast.error(err.response?.data?.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                {step === 'email' && (
                    <div>
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                <MailCheck className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Forgot Password?
                            </h2>
                            <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
                            </div>

                            <form className="space-y-6" onSubmit={handleForgotPassword}>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    placeholder="Enter your email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-6 py-4 text-sm border-2 border-gray-200 rounded-xl focus:green-orange-500 focus:ring-2 focus:ring-green-500 focus:outline-none transition-all duration-300 bg-white/80 hover:bg-white "
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>

                            <GradientButton type="submit" disabled={isLoading}>
                                <span className="flex items-center justify-center space-x-2">
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <Send className="w-5 h-5" />
                                        </>
                                    )}
                                </span>
                            </GradientButton>
                        </form>

                       
                    </div>
                )}

                {step === 'otp' && (
                    <div>
                        <div className="text-center mb-8">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-500 to-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                <BadgeCheck className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Reset Password
                            </h2>
                            <p className="text-gray-500 mt-2">Enter the OTP and your new password</p>
                        </div>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={otp}
                                        placeholder="Enter 6-digit OTP"
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength="6"
                                        className="w-full px-6 py-4 text-sm text-center tracking-widest border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300 bg-white/80 hover:bg-white backdrop-blur-sm"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                        <KeyRound className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        placeholder="Enter new password"
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-6 py-4 text-sm border-2 border-gray-200 rounded-xl 
                                                focus:border-green-500 focus:ring-2 focus:ring-green-200 
                                                bg-white/80 hover:bg-white transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        placeholder="Confirm new password"
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-6 py-4 text-sm border-2 border-gray-200 rounded-xl 
                                                focus:border-green-500 focus:ring-2 focus:ring-green-200 
                                                bg-white/80 hover:bg-white transition-all duration-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <GradientButton type="submit">
                                    <span className="flex items-center justify-center space-x-2">
                                    <span>Reset Password</span>
                                        <BadgeCheck className="w-5 h-5" />
                                    </span>
                                </GradientButton>
                            </form>
                            <div className="mt-6 text-center">
                            <p className="text-sm text-gray-500">
                                Didn't receive the OTP?
                                <button
                                   onClick={() => {
                                        localStorage.removeItem("forgot_step");
                                        localStorage.removeItem("forgot_email");

                                        setStep('email');
                                        setOtp('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}

                                    className="ml-1 text-slate-600 hover:text-slate-700 font-medium hover:underline transition-colors duration-200 cursor-pointer">
                                    Try Again
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
