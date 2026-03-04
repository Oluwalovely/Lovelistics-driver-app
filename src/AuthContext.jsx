import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = cookies.get('driver_user');
        const savedToken = cookies.get('driver_token');
        if (savedUser && savedToken) {
            setUser(savedUser);
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        cookies.set('driver_user', userData, { path: '/', maxAge: 18000 });
        cookies.set('driver_token', token, { path: '/', maxAge: 18000 });
        setUser(userData);
    };

    const logout = () => {
        cookies.remove('driver_user', { path: '/' });
        cookies.remove('driver_token', { path: '/' });
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);