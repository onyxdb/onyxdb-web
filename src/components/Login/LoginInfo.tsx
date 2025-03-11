import {Button, Link, UserLabel} from '@gravity-ui/uikit';
import {useAuth} from '@/auth/useAuth';

export function LoginInfo() {
    const { isAuthenticated, logout } = useAuth();

    const loggerUser = {
        data: {
            username: 'Artem Fedorov',
        },
    };

    if (loggerUser.data && loggerUser.data) {
        return <UserLabel text={loggerUser.data.username} />;
    }

    return (
        <Link href="/oauth/login">
            <Button>Login</Button>
        </Link>
    );
}
