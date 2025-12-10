import React, { useState } from "react";
import HeaderAdmin from "../../components/HeaderAdmin";
import SidebarManager from "../../components/SidebarManager";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ManagerDashboard = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
    <div className="flex h-screen overflow-hidden">
        <div className="w-full">
            <div className="mb-36">
                <HeaderAdmin />
            </div>

            <SidebarManager
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed((prev) => !prev)}
            />

            <div
                className={`flex-1 transition-all duration-300 p-8 ${
                    isCollapsed ? "ml-16" : "ml-72"
                }`}
            >
                <div className="h-[80vh] flex flex-col items-center justify-center text-center px-6">

                    <h1 className="text-5xl font-extrabold uppercase text-gray-800">
                        Welcome back, Manager! 👋
                    </h1>

                    <p className="text-lg text-gray-600 mt-4 max-w-2xl">
                        Assign technicians, view customer information and transaction, and oversee bookings efficiently.
                        Use the sidebar to navigate through your tools and modules.
                    </p>


                    <div className="mt-10 bg-green-600 text-white px-8 py-4 rounded-xl shadow-lg">
                        <p className="text-lg font-semibold">
                            You're logged in to the Manager Dashboard
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </div>
);

};

export default ManagerDashboard;