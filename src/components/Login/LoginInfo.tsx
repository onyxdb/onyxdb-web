'use client';

import {Card, Link, UserLabel} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';

export function LoginInfo() {
    const {user} = useAuth();

    if (!user) {
        return (
            <Card>
                <Link view="normal" href="/login">
                    Login
                </Link>
            </Card>
        );
    }

    return <UserLabel text={user.account.username} />;
}
