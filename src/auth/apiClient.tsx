import axios, {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {clearTokens, getAccessToken, refreshToken, setTokens} from '@/auth/authService';

const apiClient: AxiosInstance = axios.create({
    baseURL: '',
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
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
        try {
            if (error.response?.status === 403 && originalRequest) {
                const newTokens = await refreshToken();
                setTokens(newTokens.accessToken, newTokens.refreshToken);
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
                return apiClient(originalRequest);
            } else if (error.response?.status === 401 && !window.location.href.endsWith('/login')) {
                throw new Error('Unauthorized');
            }
        } catch (refreshError) {
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
        return Promise.reject(error);
    },
);

export default apiClient;
