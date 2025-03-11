import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {logout} from '@/auth/authService';

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        const performLogout = async () => {
            await logout();
            router.push('/login');
        };

        performLogout();
    }, []);

    return <div>Logging out...</div>;
}
