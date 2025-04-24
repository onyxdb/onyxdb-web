'use client';

import React, {useEffect, useState} from 'react';
import {AppHeader, ButtonView} from '@/components/AppHeader/AppHeader';
import {useAuth} from '@/context/AuthContext';
import {CirclePlus, Pencil, TrashBin} from '@gravity-ui/icons';
import {usePathname, useRouter} from 'next/navigation';
import ClusterView from '@/components/Cluster/ClusterView';
import {mdbMongoDbApi, mdbProjectsApi, productsApi} from '@/app/apis';
import {V1MongoClusterResponse} from '@/generated/api-mdb';
import {ProductDTOGet} from '@/generated/api';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

export default function ClusterViewPage() {
    const [cluster, setCluster] = useState<V1MongoClusterResponse | null>(null);
    const [productParents, setProductParents] = useState<ProductDTOGet[]>([]);
    const {checkPermission} = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const clusterId = pathname.split('/').pop() ?? '';

    const handleEdit = () => {
        router.push(`/clusters/edit/${clusterId}`);
    };

    const fetchCluster = async () => {
        try {
            const clusterResponse = await mdbMongoDbApi.getCluster({clusterId});
            setCluster(clusterResponse.data);

            const projectResponse = await mdbProjectsApi.getProject({
                projectId: clusterResponse.data.projectId,
            });

            const response = await productsApi.getProductParents({
                productId: projectResponse.data.productId,
            });
            const reversedData = response.data.reverse();
            setProductParents(reversedData);
        } catch (error) {
            console.error('Error fetching cluster:', error);
        }
    };

    useEffect(() => {
        fetchCluster();
    }, [clusterId]);

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
        {href: '/products', text: 'Продукты'},
        ...productParents.map((parent) => ({
            href: `/products/view/${parent.id}`,
            text: parent.name,
        })),
        {href: '/projects', text: 'Проекты'},
        {href: `/projects?prjId=${cluster?.projectId}`, text: `${cluster?.name}`},
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

    if (checkPermission('cluster', 'edit')) {
        actions.push({
            text: 'Редактировать кластер',
            action: handleEdit,
            icon: Pencil,
        });
    }

    if (checkPermission('cluster', 'delete')) {
        actions.push({
            text: 'Удалить кластер',
            action: handleDelete,
            icon: TrashBin,
            view: ButtonView.OutlinedDanger,
        });
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            {cluster && <ClusterView cluster={cluster} />}
        </div>
    );
}
