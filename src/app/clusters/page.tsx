'use client';

import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Box} from '@/components/Layout/Box';
import {useAuth} from '@/context/AuthContext';
import {CirclePlus} from '@gravity-ui/icons';
import {useRouter} from 'next/navigation';
import ClusterTable from '@/components/tables/ClustersTable';
import {AsideComp} from '@/app/AsideComp';

export default function ClustersPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();

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
            icon: CirclePlus,
        });
    }

    return (
        <AsideComp>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-1">Каталог кластеров</Text>
                </Box>
                <ClusterTable />
            </div>
        </AsideComp>
    );
}
