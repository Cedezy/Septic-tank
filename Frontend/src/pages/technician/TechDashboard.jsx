import SidebarTech from '../../components/SidebarTech';
import logo from '../../assets/logo.png'

const TechDashboard = () => {
    return (
        <SidebarTech>
            <div className="flex items-center justify-center py-20">
                <div className="bg-white rounded-md p-4 max-w-2xl text-center flex flex-col justify-center items-center">
                    <img className='h-40 md:h-50 w-40 md:w-50 mb-4' src={logo} alt="" />
                    <h1 className="text-2xl md:text-4xl font-bold mb-4 text-gray-700">Welcome to RMG Septic Tank Cleaning Services</h1>
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
