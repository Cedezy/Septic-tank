import logo from '../assets/logo.png';

const HeaderAdmin = () => {

    return (
        <div className='fixed w-full bg-white z-10'>
            <div className='flex px-2 items-center md:justify-center border-b-1 border-gray-200'>
                <img src={logo} alt="Logo" className="h-30 md:h-36 max-h-full object-contain" />
                <h2 className='italic font-semibold text-md md:text-2xl px-2 md:px-5'>RMG SEPTIC TANK CLEANING SERVICES</h2>
            </div>
        </div>
    )
}

export default HeaderAdmin