'use client';

import React from 'react';
import {AppHeader, ButtonView} from '@/components/AppHeader/AppHeader';
import {useAuth} from '@/context/AuthContext';
import {CirclePlus, Pencil, TrashBin} from '@gravity-ui/icons';
import {usePathname, useRouter} from 'next/navigation';
import ClusterView from '@/components/Cluster/ClusterView';

export default function ClusterViewPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const clusterId = pathname.split('/').pop() ?? '';

    const handleEdit = () => {
        console.log(clusterId);
    };

    const handleDelete = () => {
        console.log(clusterId);
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
        actions.push({
            text: 'Редактировать кластер',
            action: handleEdit,
            icon: <Pencil />,
        });
    }

    if (checkPermission('cluster', 'delete')) {
        actions.push({
            text: 'Удалить кластер',
            action: handleDelete,
            icon: <TrashBin />,
            view: ButtonView.OutlinedDanger,
        });
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            <ClusterView clusterId={clusterId} />
        </div>
    );
}
