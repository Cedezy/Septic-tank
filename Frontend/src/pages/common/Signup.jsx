import React, { useState, useEffect } from 'react';
import axios from '../../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff } from "lucide-react";

const Signup = () => {
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [street, setStreet] = useState('');
    const [phone, setPhone] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [gender, setGender] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [signupOtp, setSignupOtp] = useState('');
    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [timer, setTimer] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isFormDirty, setIsFormDirty] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const navigate = useNavigate();
    const [cities, setCities] = useState([]);
    const [barangays, setBarangays] = useState([]);
    const [showGenderModal, setShowGenderModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showBarangayModal, setShowBarangayModal] = useState(false);

    const handleChange = (setter) => (e) => {
      setter(e.target.value);
      setIsFormDirty(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        let newErrors = {};

        if (!fullname) newErrors.fullname = "Full name is required.";
        if (!phone) newErrors.phone = "Phone number is required.";
        if (!email) newErrors.email = "Email is required.";

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && !emailRegex.test(email)) newErrors.email = "Invalid email address.";

        if (!gender) newErrors.city = "Sex is required.";
        if (!birthdate) newErrors.city = "Birthdate is required.";
        if (!city) newErrors.city = "City is required.";
        if (!city) newErrors.city = "City is required.";
        if (!barangay) newErrors.barangay = "Barangay is required.";
        if (!street) newErrors.street = "Street address is required.";

        if (!password) newErrors.password = "Password is required.";
        if (!confirmPassword) newErrors.confirmPassword = "Please confirm password.";
        if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post("/auth/signup", {
                email,
                fullname,
                password,
                city,
                barangay,
                street,
                phone,
                birthdate,
                gender
            });

            setIsLoading(false);
            toast.success(response.data.message);

            if (response.data?.user?.isVerified === false) {
                setStep(2);
            } else {
                navigate("/login");
            }
        } catch (err) {
            setIsLoading(false);
            toast.error(err.response?.data?.message);
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
 
    // Warn user if they try to close/refresh the tab with unsaved info
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isFormDirty) {
                e.preventDefault();
                e.returnValue = ""; 
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () =>
            window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isFormDirty]);


    return (
        <div className="min-h-screen">
            <div className="flex justify-center items-center min-h-screen py-12">
              {/* BACK BUTTON */}
                <button 
                    type="button"
                    onClick={() => {
                        if (isFormDirty) {
                        setShowLeaveModal(true); 
                        } else {
                        navigate(-1); 
                        }
                    }}
                    className="absolute justify-center left-4 top-4 text-gray-600 hover:text-gray-800 flex items-center gap-1 sm:left-6 sm:top-6"
                    >
                    <span className="text-xl">←</span>
                    <span className="text-sm font-medium">Back</span>
                </button>

                {step === 1 && (
                    <div className="w-full max-w-xl px-4 sm:px-0">
                        <div className="bg-white rounded-lg sm:rounded-2xl shadow-md overflow-hidden">
                            
                            {/* Header */}
                            <div className="px-4 sm:px-8 py-4 text-center">
                                <h1 className="text-2xl sm:text-2xl font-bold text-gray-700 tracking-tight">
                                    Create Your Account
                                </h1>
                                <p className="text-gray-600 text-sm sm:text-md">
                                    Join us and start your journey today
                                </p>
                            </div>
                            <div className="px-4 sm:px-8 py-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Full Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="Enter your full name"
                                                    value={fullname}
                                                    onChange={handleChange(setFullname)}
                                                    className={`w-full pl-4 pr-4 py-2 text-sm border-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                                        errors.fullname ? "border-red-500" : "border-gray-200"
                                                    }`}
                                                />
                                                {errors.fullname && <p className="text-red-500 text-xs">{errors.fullname}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Phone Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    placeholder="Enter phone number"
                                                    value={phone}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, "");
                                                        if (value.length <= 11) setPhone(value);
                                                    }}
                                                    className={`w-full pl-4 pr-4 py-2 text-sm border-2 rounded-sm focus:ring-2 focus:ring-green-500 ${
                                                        errors.phone ? "border-red-500" : "border-gray-200"
                                                    }`}
                                                />
                                                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
                                            </div>

                                            <div className="md:col-span-2 space-y-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    value={email}
                                                    onChange={handleChange(setEmail)}

                                                    className={`w-full pl-4 pr-4 py-2 text-sm border-2 rounded-sm focus:ring-2 focus:ring-green-500 ${
                                                        errors.email ? "border-red-500" : "border-gray-200"
                                                    }`}
                                                />
                                                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Birth Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    value={birthdate}
                                                    onChange={handleChange(setBirthdate)}
                                                    max={new Date().toISOString().split("T")[0]}
                                                    className={`w-full pl-4 pr-4 py-2 text-sm border-2 rounded-sm focus:ring-2 focus:ring-green-500 ${
                                                        errors.birthdate ? "border-red-500" : "border-gray-200"
                                                    }`}
                                                />
                                                {errors.birthdate && <p className="text-red-500 text-xs">{errors.birthdate}</p>}
                                            </div>

                                            <div className="relative w-full">
                                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                    Sex <span className="text-red-500">*</span>
                                                </label>
                                                <div className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 cursor-pointer relative capitalize"
                                                    onClick={() => setShowGenderModal(true)}>
                                                    {gender || "Select"}
                                                </div>
                                            </div>

                                            {showGenderModal && (
                                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                                                    <div className="bg-white rounded-md w-full max-w-md shadow-2xl transform transition-all">
                                                        {/* Header */}
                                                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                            <div>
                                                              
                                                                <h3 className="text-xl font-bold text-gray-900">Select Gender</h3>
                                                            </div>
                                                            <button
                                                                onClick={() => setShowGenderModal(false)}
                                                                className="w-8 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </div>

                                                        {/* List */}
                                                        <div className="p-6">
                                                            <div className="space-y-3">
                                                                {["male", "female"].map((g) => (
                                                                    <button
                                                                        key={g}
                                                                        onClick={() => {
                                                                            setGender(g);
                                                                            setShowGenderModal(false);
                                                                        }}
                                                                        className="w-full group px-5 py-4 bg-white border-2 border-gray-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-center font-semibold text-gray-700 hover:text-purple-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] capitalize"
                                                                    >
                                                                        <div>                                                        
                                                                            <span>{g}</span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
                                        <div className="relative w-full mt-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                City/Municipality <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div
                                                className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 cursor-pointer relative"
                                                onClick={() => setShowCityModal(true)}>
                                                {city || "Select city..."}
                                            </div>
                                        </div>

                                        {showCityModal && (
                                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                                                <div className="bg-white rounded-md w-full max-w-md shadow-2xl transform transition-all">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                        <div>
                                                            
                                                            <h3 className="text-xl font-bold text-gray-900">Select City/Municipality</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowCityModal(false)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* List */}
                                                    <div className="p-4 max-h-96 overflow-y-auto">
                                                        <div className="space-y-2">
                                                            {cities.map((c) => (
                                                                <button
                                                                    key={c.code}
                                                                    onClick={() => {
                                                                        setCity(c.name);
                                                                        setBarangay("");
                                                                        setShowCityModal(false);

                                                                        fetch(`https://psgc.gitlab.io/api/cities-municipalities/${c.code}/barangays/`)
                                                                            .then((res) => res.json())
                                                                            .then((data) => setBarangays(data))
                                                                            .catch((err) => console.error('Error fetching barangays:', err));
                                                                    }}
                                                                    className="w-full group px-4 py-3.5 bg-white border-2 border-gray-100 rounded-md hover:border-blue-500 hover:bg-blue-50 transition-all text-left font-medium text-gray-700 hover:text-blue-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{c.name}</span>
                                                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="relative w-full mt-4">
                                            <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                                                Barangay <span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div
                                                className={`w-full border-2 border-gray-200 rounded-lg py-3 px-4 cursor-pointer relative ${!city ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                                onClick={() => city && setShowBarangayModal(true)}
                                            >
                                                {barangay || "Select barangay..."}
                                            </div>
                                        </div>

                                        {showBarangayModal && (
                                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 animate-in fade-in duration-200">
                                                <div className="bg-white rounded-md w-full max-w-md shadow-2xl transform transition-all">
                                                    {/* Header */}
                                                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                                        <div>
                                                         
                                                            <h3 className="text-xl font-bold text-gray-900">Select Barangay</h3>
                                                        </div>
                                                        <button
                                                            onClick={() => setShowBarangayModal(false)}
                                                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* List */}
                                                    <div className="p-4 max-h-96 overflow-y-auto">
                                                        <div className="space-y-2">
                                                            {barangays.map((b) => (
                                                                <button
                                                                    key={b.code}
                                                                    onClick={() => {
                                                                        setBarangay(b.name);
                                                                        setShowBarangayModal(false);
                                                                    }}
                                                                    className="w-full group px-4 py-3.5 bg-white border-2 border-gray-100 rounded-md hover:border-green-500 hover:bg-green-50 transition-all text-left font-medium text-gray-700 hover:text-green-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <span>{b.name}</span>
                                                                        <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                        </svg>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="relative w-full mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Street Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter your street address"
                                                value={street}
                                                onChange={(e) => setStreet(e.target.value)}
                                                className={`w-full pl-4 pr-4 py-2 text-sm border-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${
                                                    errors.street ? "border-red-500" : "border-gray-200"
                                                }`}
                                            />
                                            {errors.street && <p className="text-red-500 text-xs">{errors.street}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter password"
                                                    value={password}
                                                    onChange={handleChange(setPassword)}

                                                    className={`w-full pl-4 pr-10 py-2 text-sm border-2 rounded-sm focus:ring-2 focus:ring-green-500 ${
                                                        errors.password ? "border-red-500" : "border-gray-200"
                                                    }`}
                                                />
                                                <button type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm password"
                                                    value={confirmPassword}
                                                    onChange={handleChange(setConfirmPassword)}

                                                    className={`w-full pl-4 pr-10 py-2 text-sm border-2 rounded-sm focus:ring-2 focus:ring-green-500 ${
                                                        errors.confirmPassword ? "border-red-500" : "border-gray-200"
                                                    }`}
                                                />
                                                <button type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-red-500 text-xs">
                                                {errors.confirmPassword}
                                            </p>}
                                        </div>
                                    </div>

                                    <div className="pt-4 sm:pt-6">
                                        <button type="submit"
                                            disabled={isLoading}
                                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-sm shadow-md">
                                            Create My Account
                                        </button>

                                        <p className="text-center text-gray-600 text-sm mt-4">
                                            Already have an account?{" "}
                                            <Link to="/home" className="font-semibold text-green-700">
                                                Sign in
                                            </Link>
                                        </p>
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

            {showLeaveModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                  <div className="bg-white rounded-lg p-6 animate-fade-in w-80 shadow-md">
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">
                          Leave this page?
                      </h2>
                      <p className="text-gray-600 text-sm mb-4">
                          Your changes will be lost if you leave now.
                      </p>

                      <div className="flex justify-end gap-2">
                          <button
                             onClick={() => navigate(-1)}
                              className="px-4 py-2 border rounded text-gray-700"
                          >
                              Yes
                          </button>

                          <button
                          onClick={() => setShowLeaveModal(false)}
                              
                              className="px-4 py-2 bg-red-500 text-white rounded"
                          >
                              No
                          </button>
                      </div>
                  </div>
              </div>
          )}

        </div>
    );
};

export default Signup;
