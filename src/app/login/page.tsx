'use client';

import React, {useState} from 'react';
import {Button, Card, Text, TextInput, useToaster} from '@gravity-ui/uikit';
import {login} from '@/auth/authService';
import {Box} from '@/components/Layout/Box';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {useRouter} from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const toaster = useToaster();

    const handleLogin = async () => {
        try {
            await login(username, password);
            toaster.add({
                name: `login_success`,
                title: 'Успешный логин',
                content: `Вы указали правильный пароль ${username}`,
                theme: 'success',
            });
            router.replace('/');
            router.refresh();
        } catch (error) {
            console.info('login_failed', error);
            toaster.add({
                name: `login_failed`,
                title: 'Ошибка логина в аккаунт',
                content: `Вы указали неверный логин или пароль`,
                theme: 'danger',
            });
        }
    };

    return (
        <Card
            style={{
                margin: '200px auto',
                display: 'flex',
                justifyContent: 'center',
                alignContent: 'center',
            }}
            maxWidth="400px"
            maxHeight="600px"
        >
            <VerticalStack align="center" gap={10}>
                <Box marginTop="30px">
                    <Text variant="header-2">Log in</Text>
                </Box>
                <Text variant="subheader-1">Sign in to access MDB Platform</Text>
                <Box marginLeft="30px" marginRight="30px">
                    <TextInput
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Box>
                <Box marginLeft="30px" marginRight="30px">
                    <TextInput
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Box>
                <Box marginTop="10px" marginBottom="10px">
                    <Button onClick={handleLogin}>Login</Button>
                </Box>
            </VerticalStack>
        </Card>
    );
}
