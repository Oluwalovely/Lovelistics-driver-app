import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import OrderDetails from './pages/OrderDetails';
import Notifications from './pages/Notifications';
import AuthGuard from './auth/AuthGuard';
import ForgotPassword from './pages/Forgotpassword';
import VerifyOTP from './pages/Verifyotp';
import ResetPassword from './pages/Resetpassword';
import Profile from './pages/Profile';


// Public Route
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user?.role === 'driver' ? <Navigate to="/dashboard" replace /> : children;
};

const AppRoutes = () => (
    <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Auth pages — redirect to dashboard if already logged in */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Protected routes — AuthGuard redirects to /login if not authenticated */}
        <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders/:orderId" element={<OrderDetails />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
);

const App = () => (
    <BrowserRouter>
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    </BrowserRouter>
);

export default App;