import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'universal-cookie';

const AuthContext = createContext();
const cookies = new Cookies();

const COOKIE_OPTIONS = {
    path: '/',
    maxAge: 18000, 
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const savedToken = cookies.get('driver_token');
        const savedUser = cookies.get('driver_user');

        if (savedToken && savedUser) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);


    const login = (userData, token) => {
        cookies.set('driver_token', token, COOKIE_OPTIONS);
        cookies.set('driver_user', userData, COOKIE_OPTIONS);
        setUser(userData);
    };


    const updateUser = (updatedData) => {
        const merged = { ...user, ...updatedData };
        cookies.set('driver_user', merged, COOKIE_OPTIONS);
        setUser(merged);
    };


    const logout = () => {
        cookies.remove('driver_token', { path: '/' });
        cookies.remove('driver_user', { path: '/' });
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, setUser, updateUser, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);