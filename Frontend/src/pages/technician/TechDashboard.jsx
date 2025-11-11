import SidebarTech from '../../components/SidebarTech';

const TechDashboard = () => {
    return (
        <SidebarTech>
            <div className="flex items-center justify-center py-20">
                <div className="bg-white shadow-md rounded-lg p-8 w-3/4 max-w-2xl text-center">
                    <h1 className="text-2xl font-bold mb-4">Welcome to RMG Septic Tank Cleaning Services</h1>
                    <p className="text-gray-700">
                        This is your technician dashboard. Here you can manage your tasks, view schedules, 
                        and keep track of all cleaning services assigned to you.
                    </p>
                </div>
            </div>
        </SidebarTech>
    );
};

export default TechDashboard;
