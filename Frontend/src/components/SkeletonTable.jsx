import React from "react";

const SkeletonTable = ({
    rows = 8,
    columns = 7,
}) => {
    return (
        <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                    {[...Array(columns)].map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-4">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
};

export default SkeletonTable;
