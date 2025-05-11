'use client';

import React from 'react';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {useAuth} from '@/context/AuthContext';
import {useRouter} from 'next/navigation';
import {ClusterForm, ClusterFormValues} from '@/components/forms/ClusterForm';
import {mdbApi} from '@/app/apis';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {CreateMongoClusterRequestDTO} from '@/generated/api';

export default function ClusterCreatePage() {
    const {checkPermission} = useAuth();
    const router = useRouter();

    const handleCreate = (values: ClusterFormValues) => {
        const request: CreateMongoClusterRequestDTO = {
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
                version: values.clusterVersion,
                backup: {
                    isEnabled: values.backupIsEnabled,
                    schedule: values.backupSchedule,
                    limit: values.backupLimit,
                },
            },
            database: values.database,
            user: {
                name: values.user.name,
                password: values.user.password,
            },
        };
        console.info('Cluster create request values', request);
        mdbApi
            .createCluster({createMongoClusterRequestDTO: request})
            .then((_) => {
                return toaster.add({
                    name: 'cluster_created',
                    title: 'Кластер успешно создан',
                    content: 'Операция выполнена успешно.',
                    theme: 'success',
                });
            })
            .catch((error) => {
                console.error('Ошибка при создании кластера:', error);
                toaster.add({
                    name: 'error_cluster_created',
                    title: 'Ошибка создания кластера',
                    content: `Ошибка: ${error}`,
                    theme: 'danger',
                });
            });
        router.push('/clusters');
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
                <ClusterForm submitAction={handleCreate} cancelAction={handleCancel} />
            </div>
        </div>
    );
}
