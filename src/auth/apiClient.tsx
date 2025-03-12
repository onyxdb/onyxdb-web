import axios, {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {refreshToken} from '@/auth/authService';

const apiClient: AxiosInstance = axios.create({
    baseURL: '',
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        // TODO юзать функцию из @/generated/api/common
        // setBearerAuthToObject()
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && originalRequest) {
            try {
                const newTokens = await refreshToken();
                localStorage.setItem('accessToken', newTokens.accessToken);
                localStorage.setItem('refreshToken', newTokens.refreshToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    },
);

export default apiClient;
