'use client';

import React, {useEffect, useState} from 'react';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {useAuth} from '@/context/AuthContext';
import {usePathname, useRouter} from 'next/navigation';
import {mdbApi} from '@/app/apis';
import {ClusterForm, ClusterFormValues} from '@/components/forms/ClusterForm';
import {MongoClusterDTO, UpdateMongoClusterRequestDTO} from '@/generated/api';

export default function ClusterEditPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const clusterId = pathname.split('/').pop() ?? '';
    const [cluster, setCluster] = useState<MongoClusterDTO | null>(null);

    const fetchCluster = async () => {
        try {
            const response = await mdbApi.getCluster({clusterId: clusterId});
            setCluster(response.data);
        } catch (error) {
            console.error('Error fetching cluster:', error);
        }
    };

    useEffect(() => {
        fetchCluster();
    }, [clusterId]);

    const handleEdit = async (values: ClusterFormValues) => {
        try {
            const request: UpdateMongoClusterRequestDTO = {
                // name: values.name,
                description: values.description,
                config: {
                    resources: {
                        // storage: values.storage,
                        // storageClass: values.storageClass,
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
            };
            console.log('Cluster create request values', request);
            await mdbApi.updateCluster({
                clusterId: clusterId,
                updateMongoClusterRequestDTO: request,
            });
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
        {href: `/clusters/view/${cluster?.id}`, text: `${cluster?.name}`},
    ];

    if (!checkPermission('cluster', 'create')) {
        return <div>No access</div>;
    }

    if (!cluster) {
        return <div>No data</div>;
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} />
            <div style={{padding: '20px'}}>
                <ClusterForm
                    initialValues={cluster ?? undefined}
                    submitAction={handleEdit}
                    cancelAction={handleCancel}
                />
            </div>
        </div>
    );
}
