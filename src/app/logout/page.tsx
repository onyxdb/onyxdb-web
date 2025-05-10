'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {logout} from '@/auth/authService';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

export default function Logout() {
    const router = useRouter();

    const performLogout = async () => {
        await logout();
        toaster.add({
            name: `logout_success`,
            title: 'Успешный логаут',
            content: `Всё было забыто`,
            theme: 'success',
        });
        router.push('/login');
        // router.refresh();
    };
    useEffect(() => {
        performLogout();
    }, []);

    return <div style={{margin: 'auto'}}>Logging out...</div>;
}
