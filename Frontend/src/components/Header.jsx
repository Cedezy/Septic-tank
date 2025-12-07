import React, { useState, useEffect } from "react";
import { LogOut, Menu, X } from "lucide-react";
import axios from "../lib/axios";
import logo from "../assets/logo.png";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const [customer, setCustomer] = useState("");
  const [islogout, setIslogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const fetchCustomer = async () => {
    try {
      const response = await axios.get("/user/me", { withCredentials: true });
      setCustomer(response.data.user);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) fetchCustomer();
  }, [user]);

  // Only show navLinks if user is a customer
  const navLinks =
    user && user.role === "customer"
      ? [
          { label: "My Account", href: "/customer/dashboard" },
          { label: "My Bookings", href: "/customer/bookings" },
          { label: "Services", href: "/services" },
          { label: "About Us", href: "/aboutus" },
          { label: "FAQs", href: "/faqs" },
          { label: "Contact Us", href: "/contactus" },
        ]
      : [];

  return (
    <>
      <header className="bg-gray-50 backdrop-blur-md shadow-sm fixed top-0 w-full z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-full">

            {/* LOGO */}
            <Link to="/home" className="flex items-center space-x-2">
              <img src={logo} alt="Logo" className="h-20 object-contain" />
            </Link>

            {/* DESKTOP NAV - only for logged-in customer */}
            {user && user.role === "customer" && (
              <nav className="hidden md:flex items-center gap-10">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-gray-700 hover:text-green-600 transition font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-4">

              {/* Logged-in customer: Logout + hamburger */}
              {user && user.role === "customer" ? (
                <>
                  <button
                    onClick={() => setIslogout(true)}
                    className="py-2 px-4 text-red-600 font-semibold hover:text-red-800 transition"
                  >
                    Logout
                  </button>

                  {/* Hamburger menu for mobile */}
                  {navLinks.length > 0 && (
                    <button
  className="md:hidden p-2"
  onClick={() => setMenuOpen((prev) => !prev)} // toggle instead of always true
>
  <Menu className="w-7 h-7 text-gray-700" />
</button>

                  )}
                </>
              ) : (
                // Not logged in: show Login/Signup always
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="py-2 px-4 text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="py-2 px-6 bg-green-500 text-white rounded-full hover:bg-green-600 transition font-medium"
                  >
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-IN MENU - only for logged-in customer */}
      {menuOpen && user && user.role === "customer" && (
        <div className="md:hidden fixed top-[80px] left-0 w-full bg-white shadow-xl z-40 p-6 animate-fade-down">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-gray-700 text-sm hover:text-green-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* LOGOUT MODAL */}
      {islogout && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-md shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h2>
              <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
            </div>

            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setIslogout(false)}
                className="py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setIslogout(false);
                  navigate("/home");
                }}
                className="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-sm transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
