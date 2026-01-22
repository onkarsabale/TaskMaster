import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
});

// Add Authorization header interceptor for cross-domain production
api.interceptors.request.use((config) => {
    // Try to get token from persisted auth storage
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
        try {
            const parsed = JSON.parse(authStorage);
            const token = parsed?.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // Ignore parse errors
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (redirect to login or clear store)
            // window.location.href = '/login'; // Simple redirect
        }
        return Promise.reject(error);
    }
);

export default api;
