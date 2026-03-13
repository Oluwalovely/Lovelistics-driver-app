import axios from 'axios';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

API.interceptors.request.use((config) => {
    const token = cookies.get('driver_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            cookies.remove('driver_token', { path: '/' });
            cookies.remove('driver_user', { path: '/' });
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const registerDriver = (data) => API.post('/register', data);
export const loginDriver = (data) => API.post('/login', data);

export const getMyOrders = (driverId) => API.get(`/drivers/${driverId}/orders`);
export const getOrderById = (orderId) => API.get(`/orders/${orderId}`);
export const updateOrderStatus = (orderId, status) => API.patch(`/orders/${orderId}/status`, { status });
export const deleteOrder = (orderId) => API.delete(`/orders/${orderId}`);

export const sendLocation = (orderId, locationData) => API.post(`/orders/${orderId}/tracking`, locationData);

export const getDriverProfile = () => API.get('/drivers/profile');
export const updateDriverProfile = (data) => API.patch('/drivers/profile', data);
export const uploadDriverAvatar = (formData) => API.patch('/drivers/profile/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const changeDriverPassword = (data) => API.patch('/drivers/change-password', data);

export const getMyNotifications = () => API.get('/notifications');
export const markAllAsRead = () => API.patch('/notifications/read-all');
export const markOneAsRead = (notificationId) => API.patch(`/notifications/${notificationId}/read`);

export const forgotPassword = (data) => API.post('/forgot-password', data);
export const verifyOTP = (data) => API.post('/verify-otp', data);
export const resetPassword = (data) => API.post('/reset-password', data);