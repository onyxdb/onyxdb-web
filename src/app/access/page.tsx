'use client';

import React from 'react';
import RoleTable from '@/components/tables/RoleTable';
import {rolesApi} from '@/app/apis';
import {useRouter} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {CirclePlus} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {Text} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';

export default function RolesPage() {
    const router = useRouter();
    const {checkPermission} = useAuth();

    const handleEdit = (roleId: string) => {
        console.log('Edit role with ID:', roleId);
        router.push(`/access/edit/${roleId}`);
    };

    const handleDelete = async (roleId: string) => {
        console.log('Delete role with ID:', roleId);
        if (roleId) {
            await rolesApi.deleteRole({roleId: roleId});
        }
    };

    const handleRoleCreate = () => {
        router.push(`/access/create`);
    };

    const breadCrumps = [
        {href: '/', text: 'Главная'},
        {href: '/access', text: 'Доступы'},
    ];

    const actions = [];
    if (checkPermission('web-global-role', 'create')) {
        actions.push({
            text: 'Создать роль',
            action: handleRoleCreate,
            icon: <CirclePlus />,
        });
    }

    return (
        <div>
            <AppHeader breadCrumps={breadCrumps} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Роли</Text>
                </Box>
                <RoleTable onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </div>
    );
}
