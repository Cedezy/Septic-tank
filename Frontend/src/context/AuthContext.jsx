import { createContext, useContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from "../lib/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // fetch logged-in user on mount
    const fetchUser = async () => {
        try {
        const res = await axios.get("/auth/check", { withCredentials: true });
        setUser(res.data.user);
        } catch (err) {
            console.log(err)
        setUser(null);
        } finally {
        setLoading(false);
        }
    };

    // logout function
    const logout = async () => {
        try {
            const response = await axios.post("/auth/logout", {}, { withCredentials: true });
            toast.success(response.data.message);
            setUser(null);

        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
