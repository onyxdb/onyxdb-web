'use client';

import React, {useState} from 'react';
import {mdbManagedMongoDbApi, mdbResourcePresetsApi} from '@/app/apis';
import {Icon, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {Briefcase, Calendar, Handset} from '@gravity-ui/icons';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface ClusterViewPageProps {
    clusterId: string;
}

// eslint-disable-next-line no-empty-pattern
export default async function ClusterView({clusterId}: ClusterViewPageProps) {
    const [activeTab, setActiveTab] = useState<string>('additional-info');

    const responseCluster = await mdbManagedMongoDbApi.getCluster({clusterId: clusterId});
    const cluster = responseCluster.data;

    const responseHosts = await mdbManagedMongoDbApi.listHosts({clusterId: clusterId});
    const clusterHosts = responseHosts.data;

    const responsePreset = await mdbResourcePresetsApi.getResourcePreset({
        resourcePresetId: cluster?.config.resources.presetId,
    });
    const clusterPreset = responsePreset.data;

    const renderInfoTab = () => {
        return (
            <div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Handset} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Название:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {cluster.name ?? '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Описание:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {cluster.description ?? '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Конфиг:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {clusterPreset.name}
                        </Text>
                    </HorizontalStack>
                </div>
            </div>
        );
    };

    const renderHostsTab = () => {
        return (
            <div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Briefcase} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Hosts:
                        </Text>
                        {clusterHosts.hosts.map((host) => (
                            <Text variant="body-1" color="primary">
                                {host.name}
                            </Text>
                        ))}
                    </HorizontalStack>
                </div>
            </div>
        );
    };

    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <HorizontalStack align="center" justify="space-between">
                <div>{cluster.name}</div>
                <div>{cluster.description}</div>
            </HorizontalStack>
            <Box marginTop="20px">{renderInfoTab()}</Box>
            <Box marginTop="10px" marginBottom="10px">
                <TabProvider value={activeTab} onUpdate={setActiveTab}>
                    <TabList>
                        <Tab value="info">Обзор</Tab>
                        <Tab value="hosts">Хосты</Tab>
                        <Tab value="db">Базы данных</Tab>
                        <Tab value="users">Пользователи</Tab>
                        <Tab value="logs">Логи</Tab>
                        <Tab value="monitoring">Мониторинг</Tab>
                        <Tab value="operation">Операции</Tab>
                        <Tab value="backups">Резервные копии</Tab>
                        <Tab value="alerts">Алерты</Tab>
                    </TabList>
                    <Box marginTop="10px">
                        <TabPanel value="info">{renderInfoTab()}</TabPanel>
                        <TabPanel value="hosts">{renderHostsTab()}</TabPanel>
                        <TabPanel value="db">{renderInfoTab()}</TabPanel>
                        <TabPanel value="users">{renderInfoTab()}</TabPanel>
                        <TabPanel value="logs">{renderInfoTab()}</TabPanel>
                        <TabPanel value="monitoring">{renderInfoTab()}</TabPanel>
                        <TabPanel value="operation">{renderInfoTab()}</TabPanel>
                        <TabPanel value="backups">{renderInfoTab()}</TabPanel>
                        <TabPanel value="alerts">{renderInfoTab()}</TabPanel>
                    </Box>
                </TabProvider>
            </Box>
        </div>
    );
}
