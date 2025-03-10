'use client';

import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Box} from '@/components/Layout/Box';
import {usePermissions} from '@/hooks/usePermissions';
import {CirclePlus} from '@gravity-ui/icons';
import {useRouter} from 'next/navigation';
import {businessRolesApi} from '@/app/apis';
import BusinessRolesTable from '@/components/tables/BusinessRolesTable';

export default function BusinessRolesPage() {
    const {checkPermission} = usePermissions();
    const router = useRouter();

    const handleEdit = (businessRoleId: string) => {
        console.log('Edit business role with ID:', businessRoleId);
        router.push(`/business-roles/edit/${businessRoleId}`);
    };

    const handleDelete = async (businessRoleId: string) => {
        console.log('Delete business Role with ID:', businessRoleId);
        if (businessRoleId) {
            await businessRolesApi.deleteBusinessRole({businessRoleId: businessRoleId});
        }
    };

    const handleBusinessRoleCreateModal = () => {
        console.log('Create business role modal');
        router.push(`/business-roles/create`);
    };

    const breadCrumps = [
        {href: '/', text: 'Главная'},
        {href: '/business-roles', text: 'Бизнес-роли'},
    ];

    const actions = [];
    if (checkPermission('web-global-product', 'create')) {
        actions.push({
            text: 'Создать бизнес-роль',
            action: handleBusinessRoleCreateModal,
            icon: <CirclePlus />,
        });
    }

    return (
        <div>
            <AppHeader breadCrumps={breadCrumps} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Бизнес-роли</Text>
                </Box>
                <BusinessRolesTable onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </div>
    );
}
