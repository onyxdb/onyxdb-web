'use client';

import React from 'react';
import {AppHeader, ButtonView} from '@/components/AppHeader/AppHeader';
import {useAuth} from '@/context/AuthContext';
import {CirclePlus, Pencil, TrashBin} from '@gravity-ui/icons';
import {usePathname, useRouter} from 'next/navigation';
import ClusterView from '@/components/Cluster/ClusterView';
import {mdbMongoDbApi} from '@/app/apis';
import {useToaster} from '@gravity-ui/uikit';

export default function ClusterViewPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const toaster = useToaster();

    const clusterId = pathname.split('/').pop() ?? '';

    const handleEdit = () => {
        router.push(`/clusters/edit/${clusterId}`);
    };

    const handleDelete = async () => {
        try {
            await mdbMongoDbApi.deleteCluster({clusterId: clusterId});
            toaster.add({
                name: 'cluster_delete',
                title: 'Кластер успешно удалён',
                content: 'Операция выполнена успешно.',
                theme: 'success',
            });
        } catch (error) {
            console.error('Error deleting clusters:', error);
            toaster.add({
                name: 'error_cluster_delete',
                title: 'Ошибка удаления кластера',
                content: `Не удалось удалить кластер: ${error}.`,
                theme: 'danger',
            });
        }
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
