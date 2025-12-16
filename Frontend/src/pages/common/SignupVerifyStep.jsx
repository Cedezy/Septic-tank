import React from "react";

const SignupVerifyStep = ({
    email,
    signupOtp,
    setSignupOtp,
    handleVerifyOtp,
    handleResendOtp,
    resendDisabled,
    timer,
}) => {
    return (
        <div className="w-full max-w-md bg-white rounded-sm shadow-md p-6">
            <div className="text-center mb-6">
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Verify Email
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                    Enter the code sent to
                </p>
                <p className="text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                    {email}
                </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                    </label>
                    <input
                        type="text"
                        value={signupOtp}
                        onChange={(e) => setSignupOtp(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 text-center text-lg font-mono tracking-wider"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-600 text-white font-medium py-2.5 rounded-md hover:bg-green-700"
                >
                    Verify Account
                </button>

                <div className="text-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                        Didn't receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendDisabled}
                        className="text-sm font-medium text-green-600 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {resendDisabled ? `Resend in ${timer}s` : "Resend Code"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignupVerifyStep;
