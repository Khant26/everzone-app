import { createContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://engineering-web-2026-backend-io2r.onrender.com";

const AuthContextProvider = ({ children}) => {
    let [user, setUser] = useState(null);
    let [loading, setLoading] = useState(false);

    let getUser = async () => {
        const userData = localStorage.getItem('user_data');
        if (!userData) return null;

        try {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            return parsed;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            setUser(null);
            return null;
        }
    }

    let login = async (credentials) => {
        setLoading(true);
        try {
            const username = credentials?.username ?? credentials?.email;
            const password = credentials?.password;

            const response = await axios.post(`${API_BASE_URL}/api/admin/login`, {
                username,
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const payload = response.data;
            const token = payload?.data?.token;
            const admin = payload?.data?.admin;

            if (response.status === 200 && payload?.success === true && token) {
                localStorage.setItem('access_token', token);
                localStorage.setItem('user_data', JSON.stringify(admin ?? {}));
                setUser(admin ?? {});
                return { success: true, data: payload.data };
            }

            return { success: false, error: payload?.message || 'Login failed. Please check your credentials.' };
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.message || error.response?.data?.detail || 'Login failed. Please try again.' 
            };
        } finally {
            setLoading(false);
        }
    }

    let logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user_data");
        setUser(null);
    }

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data');
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user_data');
            }
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, getUser, login, logout, loading }}>{children}</AuthContext.Provider>
    )
}

export { AuthContext, AuthContextProvider }