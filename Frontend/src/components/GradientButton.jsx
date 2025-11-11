import React from 'react';
import { ArrowRight } from 'lucide-react';

const GradientButton = ({
    type = 'button',
    isLoading = false,
    text = 'Submit',
    loadingText = 'Loading...',
    icon = <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />,
    ...rest
    }) => {
    return (
        <button
            type={type}
            disabled={isLoading}
            className="w-full py-4 px-6 bg-green-600 hover:bg-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium rounded-2xl shadow-lg transform hover:scale-105 disabled:scale-100 transition-all duration-300 flex items-center justify-center space-x-2 group cursor-pointer"
            {...rest}
        >
            {isLoading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{loadingText}</span>
                </>
            ) : (
                <>
                    <span>{text}</span>
                    {icon}
                </>
            )}
        </button>
    );
};

export default GradientButton;
