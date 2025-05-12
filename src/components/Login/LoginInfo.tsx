'use client';

import {Button, Card, Modal} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import React, {useEffect, useState} from 'react';
import {UserBlock} from '@/components/common/UserBlock';
import {useRouter} from 'next/navigation';

export const LoginInfo = () => {
    const {user, fetchUser} = useAuth();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            fetchUser();
        }, 300000); // Обновление каждые 5 минут

        return () => clearInterval(interval);
    }, [fetchUser]);


    console.log('LoginInfo', user);
    if (!user) {
        return (
            <Card type="action">
                <Button
                    size="l"
                    view="action"
                    href="/login"
                    style={{width: '100%', marginLeft: 'auto', marginRight: 'auto'}}
                >
                    Login
                </Button>
            </Card>
        );
    }

    // Функция для форматирования permissions в читаемый JSON
    const formatPermissions = (permissions: {[key: string]: {[key: string]: object} | null}) => {
        return JSON.stringify(permissions, null, 2); // Отступ в 2 пробела для красивого форматирования
    };

    return (
        <div>
            <div onClick={() => setIsInfoModalOpen(true)}>
                <UserBlock account={user.account} />
            </div>
            <Modal open={isInfoModalOpen} onOpenChange={() => setIsInfoModalOpen(false)}>
                <div style={{padding: '20px', whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
                    <h3>Разрешения:</h3>
                    <pre>{formatPermissions(user.permissions)}</pre>
                    <Button
                        size="l"
                        view="action"
                        onClick={() => {
                            setIsInfoModalOpen(false);
                            router.push('/logout');
                        }}
                        style={{
                            width: '100%',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            marginBottom: '5px',
                        }}
                    >
                        Logout
                    </Button>
                    <Button
                        size="l"
                        view="action"
                        onClick={() => setIsInfoModalOpen(false)}
                        style={{width: '100%', marginLeft: 'auto', marginRight: 'auto'}}
                    >
                        Закрыть
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
