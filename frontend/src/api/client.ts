import axios from 'axios';

const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
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
