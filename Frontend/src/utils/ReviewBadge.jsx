export const getStatusBadge = (review) => {
    const badges = [];
    
    if (review.approved) {
        badges.push(
            <span key="approved" className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                Approved
            </span>
        );
    } else {
        badges.push(
            <span key="pending" className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                Pending
            </span>
        );
    }
    
    if (review.visible) {
        badges.push(
            <span key="visible" className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                Visible
            </span>
        );
    } else {
        badges.push(
            <span key="hidden" className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                Hidden
            </span>
        );
    }
    
    return badges;
};