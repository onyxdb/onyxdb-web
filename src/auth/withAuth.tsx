import {useEffect} from 'react';
import {useRouter} from 'next/router';
import {getCurrentUser} from '@/services/authService';

export const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    await getCurrentUser();
                } catch (error) {
                    router.push('/login');
                }
            };

            checkAuth();
        }, []);

        return <WrappedComponent {...props} />;
    };
};
