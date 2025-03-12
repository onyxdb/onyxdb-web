'use client';

import {Button, Card, Modal} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import React, {useState} from 'react';
import {UserBlock} from '@/components/common/UserBlock';

export function LoginInfo() {
    const {user} = useAuth();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

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
        <div onClick={() => setIsInfoModalOpen(true)}>
            <UserBlock account={user.account} />
            <Modal open={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)}>
                <div style={{padding: '20px', whiteSpace: 'pre-wrap', fontFamily: 'monospace'}}>
                    <h3>Permissions:</h3>
                    <pre>{formatPermissions(user.permissions)}</pre>
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
