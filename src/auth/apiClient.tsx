import axios, {AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    refreshToken,
    setTokens,
} from '@/auth/authService';

const apiClient: AxiosInstance = axios.create({
    baseURL: '',
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        // TODO юзать функцию из @/generated/api/common
        // setBearerAuthToObject()
        // eslint-disable-next-line no-param-reassign
        config.headers = config.headers || {};
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        try {
            if (
                error.response?.status === 401 &&
                // @ts-ignore
                error.response.data.error?.includes('JWT expired at')
            ) {
                clearTokens();
                throw new Error('Unauthorized');
            }
            if (error.response?.status === 401 && originalRequest && getRefreshToken()) {
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
            if (!window.location.href.endsWith('/login')) {
                window.location.href = '/login';
            }
            return Promise.reject(refreshError);
        }
        return Promise.reject(error);
    },
);

export default apiClient;
