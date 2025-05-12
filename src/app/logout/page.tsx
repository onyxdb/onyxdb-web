'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {logout} from '@/auth/authService';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {useAuth} from '@/context/AuthContext';

export default function Logout() {
    const {setUser} = useAuth();
    const router = useRouter();

    const performLogout = async () => {
        await logout();
        setUser(null)
        toaster.add({
            name: `logout_success`,
            title: 'Успешный логаут',
            content: `Всё было забыто`,
            theme: 'success',
        });
        // router.refresh();
        router.push('/login');
    };
    useEffect(() => {
        performLogout();
    }, []);

    return <div style={{margin: 'auto'}}>Logging out...</div>;
}
