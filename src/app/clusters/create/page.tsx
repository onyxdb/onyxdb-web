'use client';

import React from 'react';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {useAuth} from '@/context/AuthContext';
import {useRouter} from 'next/navigation';
import {ClusterCreateForm, ClusterFormValues} from '@/components/forms/ClusterCreateForm';
import {mdbManagedMongoDbApi} from '@/app/apis';
import {V1CreateMongoClusterRequest} from '@/generated/api-mdb';

export default function ClusterCreatePage() {
    const {checkPermission} = useAuth();
    const router = useRouter();

    const handleCreate = async (values: ClusterFormValues) => {
        try {
            const request: V1CreateMongoClusterRequest = {
                name: values.name,
                description: values.description,
                projectId: values.projectId,
                config: {
                    resources: {
                        storage: values.storage,
                        storageClass: values.storageClass,
                        presetId: values.presetId,
                    },
                    replicas: values.replicas,
                },
            };
            console.log('Cluster create request values', request);
            await mdbManagedMongoDbApi.createCluster({v1CreateMongoClusterRequest: request});
            router.push('/clusters');
        } catch (error) {
            console.error('Ошибка при создании кластера:', error);
        }
    };

    const handleCancel = () => {
        router.push('/clusters');
    };

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/clusters', text: 'Кластеры'},
    ];

    if (!checkPermission('cluster', 'create')) {
        return <div>No access</div>;
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} />
            <div style={{padding: '20px'}}>
                <ClusterCreateForm createAction={handleCreate} cancelAction={handleCancel} />
            </div>
        </div>
    );
}
