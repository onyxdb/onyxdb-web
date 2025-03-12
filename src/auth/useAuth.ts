// import {useEffect, useState} from 'react';
// import {clearTokens, getAccessToken} from '@/auth/authService';
//
// export const useAuth = () => {
//     const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//
//     useEffect(() => {
//         setIsAuthenticated(Boolean(getAccessToken()));
//     }, []);
//
//     const logout = () => {
//         clearTokens();
//         setIsAuthenticated(false);
//     };
//
//     return {isAuthenticated, logout};
// };
