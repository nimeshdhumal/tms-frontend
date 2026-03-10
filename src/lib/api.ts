import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Runs before EVERY request — attaches JWT token automatically

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('tms_token');
        if (globalThis.window !== undefined) {
            config.headers.Authorization = `{Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ────────────────────────────────────────────────────
// Runs after EVERY response — handles global errors

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            //Token expired or invalid -> clear storage and redirect to login
            if (globalThis.window !== undefined) {
                localStorage.removeItem('tms_token');
                localStorage.removeItem('tms_user');
                globalThis.window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;