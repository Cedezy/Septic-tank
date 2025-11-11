import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../components/Header'

const Signup = () => {
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [street, setStreet] = useState('');
    const [phone, setPhone] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signupOtp, setSignupOtp] = useState('');
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState(0);

    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);

    // handle signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
        toast.warning('Passwords do not match');
        setIsLoading(false);
        return;
        }

        // In your handleSubmit function, before sending axios request:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        toast.warning('Please enter a valid email address.');
        setIsLoading(false);
        return;
        }


        try {
        const response = await axios.post('/auth/signup', {
            email,
            fullname,
            password,
            city,
            barangay,
            street,
            phone,
            birthdate,
        });

        setIsLoading(false);
        toast.success(response.data.message);

        if (response.data?.user?.isVerified === false) {
            setStep(2);
        } else {
            navigate('/login');
        }
        } catch (err) {
        toast.error(err.response?.data?.message);
        setIsLoading(false);
        }
    };

    // fetch cities
    useEffect(() => {
        fetch('https://psgc.gitlab.io/api/provinces/097300000/cities-municipalities/')
        .then((res) => res.json())
        .then((data) => {
            setCities(data);
        })
        .catch((err) => console.error('Error fetching cities:', err));
    }, []);

    const handleCityChange = (e) => {
        const selectedCity = e.target.value;
        setCity(selectedCity);
        setBarangays([]);

        const cityObj = cities.find((c) => c.name === selectedCity);
        if (cityObj) {
        fetch(`https://psgc.gitlab.io/api/cities-municipalities/${cityObj.code}/barangays/`)
            .then((res) => res.json())
            .then((data) => setBarangays(data))
            .catch((err) => console.error('Error fetching barangays:', err));
        }
    };

    // handle OTP verification
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
        const response = await axios.post('/auth/verify-otp', {
            email,
            signupOtp,
        });
        toast.success(response.data.message);
        setTimeout(() => navigate('/home'), 2000);
        } catch (err) {
        toast.error(err.response?.data?.message);
        }
    };

    // resend OTP
    const handleResendOtp = async () => {
        try {
        const response = await axios.post('/auth/resend-otp', { email });
        toast.success(response.data.message);
        setResendDisabled(true);
        setTimer(120);

        const countdown = setInterval(() => {
            setTimer((prev) => {
            if (prev <= 1) {
                clearInterval(countdown);
                setResendDisabled(false);
                return 0;
            }
            return prev - 1;
            });
        }, 1000);
        } catch (err) {
        toast.error(err.response?.data?.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            <div className="flex justify-center items-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
                {step === 1 && (
                    <div className="w-full max-w-xl">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className="px-8 py-4 text-center">
                                <h1 className="text-2xl font-bold text-gray-700 tracking-tight">Create Your Account</h1>
                                <p className="text-gray-600 text-md">Join us and start your journey today</p>
                            </div>
                            <div className="px-8 py-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Enter your full name" 
                                                        value={fullname} 
                                                        onChange={(e) => setFullname(e.target.value)} 
                                                        required 
                                                        className="w-full pl-4 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                                <div className="relative">
                                                   <input 
                                                        type="tel" 
                                                        placeholder="Enter phone number" 
                                                        value={phone} 
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, ''); 
                                                            if (value.length <= 11) setPhone(value);        
                                                        }} 
                                                        required 
                                                        maxLength={11}  
                                                        className="w-full pl-4 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                                <div className="relative">
                                                    <input 
                                                        type="email" 
                                                        placeholder="Enter your email" 
                                                        value={email} 
                                                        onChange={(e) => setEmail(e.target.value)} 
                                                        required 
                                                        className="w-full pl-4 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={birthdate}
                                                        onChange={(e) => setBirthdate(e.target.value)}
                                                        required
                                                        max={new Date().toISOString().split("T")[0]}
                                                        className="w-full pl-4 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">City/Municipality</label>
                                                <div className="relative">
                                                    <select 
                                                        value={city} 
                                                        onChange={handleCityChange} 
                                                        required 
                                                        className="w-full pl-4 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800 appearance-none"
                                                    >
                                                        <option value="">Select</option>
                                                        {cities.map((c) => (
                                                            <option key={c.code} value={c.name}>
                                                                {c.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Barangay</label>
                                                <div className="relative">
                                                    <select 
                                                        value={barangay} 
                                                        onChange={(e) => setBarangay(e.target.value)} 
                                                        required 
                                                        className="w-full pl-4 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800 appearance-none"
                                                        disabled={!city}
                                                    >
                                                        <option value="">Select Barangay</option>
                                                        {barangays.map((brgy) => (
                                                            <option key={brgy.code} value={brgy.name}>
                                                                {brgy.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="md:col-span-2 space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Street Address</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                                        </svg>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        placeholder="Enter street address" 
                                                        value={street} 
                                                        onChange={(e) => setStreet(e.target.value)} 
                                                        required 
                                                        className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Security Section */}
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                                        </svg>
                                                    </div>
                                                    <input 
                                                        type="password" 
                                                        placeholder="Enter password" 
                                                        value={password} 
                                                        onChange={(e) => setPassword(e.target.value)} 
                                                        required 
                                                        className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                        </svg>
                                                    </div>
                                                    <input 
                                                        type="password" 
                                                        placeholder="Confirm password" 
                                                        value={confirmPassword} 
                                                        onChange={(e) => setConfirmPassword(e.target.value)} 
                                                        required 
                                                        className="w-full pl-10 pr-4 py-2 text-sm border-2 border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 placeholder-gray-400 text-gray-800"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-6">
                                        <button 
                                            type="submit" 
                                            disabled={isLoading} 
                                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 cursor-pointer px-6 rounded-sm ease-in-out duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating Your Account...
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <span className="mr-2">Create My Account</span>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                                    </svg>
                                                </div>
                                            )}
                                        </button>

                                        <div className="text-center mt-4">
                                            <p className="text-gray-600 text-sm">
                                                Already have an account?{' '}
                                                <Link to="/home" className="font-semibold text-green-700 hover:text-green-800 transition-colors">
                                                    Sign in
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="w-full max-w-md bg-white rounded-sm shadow-md p-6">
                        <div className="text-center mb-6">
                            <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h2>
                            <p className="text-sm text-gray-600 mb-3">
                                Enter the code sent to
                            </p>
                            <p className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                                {email}
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                                <input 
                                    type="text" 
                                    value={signupOtp} 
                                    onChange={(e) => setSignupOtp(e.target.value)} 
                                    placeholder="Enter 6-digit code" 
                                    required 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-lg font-mono tracking-wider"
                                    maxLength="6"
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-green-600 text-white font-medium py-2.5 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                            >
                                Verify Account
                            </button>

                            <div className="text-center pt-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                                <button 
                                    type="button" 
                                    onClick={handleResendOtp} 
                                    disabled={resendDisabled} 
                                    className="text-sm font-medium text-green-600 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                    {resendDisabled ? (
                                        <span className="flex items-center justify-center">
                                                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z"></path>
                                            </svg>
                                            Resend in {timer}s
                                        </span>
                                    ) : (
                                        "Resend Code"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Signup;
