// src/components/tabs/InfoTab.tsx
'use client';
import React from 'react';
import {Icon, Text} from '@gravity-ui/uikit';
import {Calendar, Handset} from '@gravity-ui/icons';
import {
    V1ClusterResources,
    V1MongoClusterResponse,
    V1ResourcePresetResponse,
} from '@/generated/api-mdb';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

interface InfoTabProps {
    cluster: V1MongoClusterResponse;
    clusterPreset: V1ResourcePresetResponse;
}

const InfoTab: React.FC<InfoTabProps> = ({cluster, clusterPreset}) => {
    const resources: V1ClusterResources | undefined = cluster.config?.resources;

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
            <Box marginTop="20px">
                <Text variant="subheader-1">Конфигурация кластера</Text>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        marginTop: '10px',
                    }}
                >
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Ресурсный пресет:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {resources?.presetId ?? '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Класс хранилища:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {resources?.storageClass ?? '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Хранилище:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {resources?.storage ? `${resources.storage} MB` : '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Реплики:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {cluster.config?.replicas ?? '???'}
                        </Text>
                    </HorizontalStack>
                </div>
            </Box>
        </div>
    );
};

export default InfoTab;
