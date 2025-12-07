export const getStatusBadge = (status) => {
    const statusColors = {
        'pending': 'text-yellow-800',
        'confirmed': 'text-blue-800',
        'completed': 'text-green-800 italic',
        'cancelled': 'text-red-800',
        'declined': 'text-gray-800',
    }; 
    return `py-1 rounded-full text-sm font-medium ${statusColors[status] || 'text-gray-800'}`;
};
