'use client';

import React, {useEffect, useState} from 'react';
import {mdbResourcePresetsApi} from '@/app/apis';
import {Icon, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {V1MongoClusterResponse, V1ResourcePresetResponse} from '@/generated/api-mdb';
import InfoTab from '@/components/Cluster/tabs/InfoTab';
import HostsTab from '@/components/Cluster/tabs/HostsTab';
import DatabasesTab from '@/components/Cluster/tabs/DatabasesTab';
import UsersTab from '@/components/Cluster/tabs/UsersTab';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import GrafanaFrame from '@/components/GrafanaFrame';
import BackupsTab from '@/components/Cluster/tabs/BackupsTab';
import MongoLogo from '../../styles/mongodb.svg';

interface ClusterViewPageProps {
    cluster: V1MongoClusterResponse;
}

// eslint-disable-next-line no-empty-pattern
export default function ClusterView({cluster}: ClusterViewPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'info';

    const [activeTab, setActiveTab] = useState(tab);
    const [clusterPreset, setClusterPreset] = useState<V1ResourcePresetResponse | null>(null);

    const fetchData = async () => {
        try {
            const presetResponse = await mdbResourcePresetsApi.getResourcePreset({
                resourcePresetId: cluster.config.resources.presetId,
            });
            setClusterPreset(presetResponse.data);
        } catch (error) {
            console.error('Error fetching cluster:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [cluster.id]);

    useEffect(() => {
        setActiveTab(tab);
    }, [tab]);

    const handleTabChange = (value: string) => {
        const createQueryString = (name: string, val: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, val);
            return params.toString();
        };
        setActiveTab(value);
        router.push(pathname + '?' + createQueryString('tab', value));
    };

    if (!cluster || !clusterPreset) {
        return <div>No data</div>;
    }

    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text variant="header-1">{cluster.name}</Text>
                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                        {cluster.description}
                    </Text>
                </div>
                <Icon data={MongoLogo} size={40} />
            </div>
            <Box marginTop="20px">
                <TabProvider value={activeTab} onUpdate={handleTabChange}>
                    <TabList>
                        <Tab value="info">Обзор</Tab>
                        <Tab value="hosts">Хосты</Tab>
                        <Tab value="db">Базы данных</Tab>
                        <Tab value="users">Пользователи</Tab>
                        <Tab value="logs">Логи</Tab>
                        <Tab value="monitoring">Мониторинг</Tab>
                        <Tab value="operation">Операции</Tab>
                        <Tab value="backups">Резервные копии</Tab>
                    </TabList>
                    <Box marginTop="10px">
                        <TabPanel value="info">
                            <InfoTab cluster={cluster} clusterPreset={clusterPreset} />
                        </TabPanel>
                        <TabPanel value="hosts">
                            <HostsTab clusterId={cluster.id} />
                        </TabPanel>
                        <TabPanel value="db">
                            <DatabasesTab clusterId={cluster.id} />
                        </TabPanel>
                        <TabPanel value="users">
                            <UsersTab clusterId={cluster.id} />
                        </TabPanel>
                        <TabPanel value="monitoring">
                            <GrafanaFrame dashboardId="SsEeTs97k" />
                        </TabPanel>
                        <TabPanel value="logs">
                            <GrafanaFrame dashboardId="bdpzp3w3jkt8ga" />
                        </TabPanel>
                        <TabPanel value="backups">
                            <BackupsTab clusterId={cluster.id} />
                        </TabPanel>
                        <TabPanel value="operation">
                            {/* Содержимое вкладки операций */}
                            <Text>Операции кластера будут здесь</Text>
                        </TabPanel>
                    </Box>
                </TabProvider>
            </Box>
        </div>
    );
}
