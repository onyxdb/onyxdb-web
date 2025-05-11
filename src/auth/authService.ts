import {authApi} from '@/app/apis';

export const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => localStorage.getItem('accessToken');

export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

export const login = async (username: string, password: string) => {
    // console.log('username, password', username, password);
    const response = await authApi.login({authRequestDTO: {username, password}});
    console.log('login response', response);
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
};

export const logout = async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
        await authApi.logout({refreshTokenDTO: {refreshToken}});
    }
    clearTokens();
};
export const refreshToken = async () => {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
        throw new Error('No refresh token found');
    }

    const response = await authApi.refreshToken({
        refreshTokenDTO: {refreshToken: refreshTokenValue},
    });
    if (response.status === 401) {
        clearTokens();
        throw new Error('Unauthorized');
    }
    setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
};

export const getCurrentUser = async () => {
    const response = await authApi.getCurrentUser();
    return response.data;
};
