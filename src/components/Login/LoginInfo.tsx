import {Button, Link, UserLabel} from '@gravity-ui/uikit';

export function LoginInfo() {
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
