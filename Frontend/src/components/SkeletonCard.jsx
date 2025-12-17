import React from 'react'

const SkeletonCard = () => (
    <div className="animate-pulse relative bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="w-full h-48 bg-gray-200 rounded-t-xl mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="mt-4 h-12 bg-gray-200 rounded"></div>
    </div>
);


export default SkeletonCard