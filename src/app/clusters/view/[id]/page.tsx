'use client';

import React from 'react';
import {Button, Icon, Text} from '@gravity-ui/uikit';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Box} from '@/components/Layout/Box';
import {useAuth} from '@/context/AuthContext';
import {CirclePlus, Pencil, TrashBin} from '@gravity-ui/icons';
import {usePathname, useRouter} from 'next/navigation';
import ClusterView from '@/components/Cluster/ClusterView';

export default function ClusterViewPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleDelete = (projectId: string) => {

    };

    const handleCreate = () => {
        router.push(`/clusters/create`);
    };

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/clusters', text: 'Кластеры'},
    ];

    const actions = [];
    if (checkPermission('cluster', 'create')) {
        actions.push({
            text: 'Создать кластер',
            action: handleCreate,
            icon: <CirclePlus />,
        });
    }

    if (checkPermission('cluster', 'edit')) {
        actions.push(
            <Button
                view="action"
                size="m"
                // onClick={handleEdit}
                style={{marginRight: '10px'}}
            >
                <Icon data={Pencil} />
                Редактировать
            </Button>,
        );
    }

    if (checkPermission('cluster', 'delete')) {
        actions.push(
            <Button view="action" size="m" onClick={handleDelete}>
                <Icon data={TrashBin} />
                Удалить
            </Button>,
        );
    }

    const clusterId = pathname.split('/').pop() ?? '';

    return (
        <div>
            <AppHeader breadCrumps={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Кластер</Text>
                </Box>
                <ClusterView clusterId={clusterId} />
            </div>
        </div>
    );
}
