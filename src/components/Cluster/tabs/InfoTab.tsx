'use client';

import React from 'react';
import {Icon, Label, Text} from '@gravity-ui/uikit';
import {Circles5Random, Cpu, Cpus, Database, SquareListUl} from '@gravity-ui/icons';
import {ClusterResourcesDTO, MongoClusterDTO, ResourcePresetResponseDTO} from '@/generated/api';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {BytesGB} from '@/components/ResourceInputField';

interface InfoTabProps {
    cluster: MongoClusterDTO;
    clusterPreset: ResourcePresetResponseDTO;
}

const InfoTab: React.FC<InfoTabProps> = ({cluster, clusterPreset}) => {
    const resources: ClusterResourcesDTO | undefined = cluster.config?.resources;
    const convertRamToGB = (ram: number) => (ram / 1024 / 1024 / 1024).toFixed(2);

    return (
        <div>
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
                            <Icon data={SquareListUl} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Конфиг:&nbsp;
                        </Text>
                        <Text variant="body-1" color="primary">
                            {clusterPreset.type} <Label>{clusterPreset.type}</Label>
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Cpus} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Оперативная память:&nbsp;
                        </Text>
                        <Text variant="body-1" color="primary">
                            {convertRamToGB(clusterPreset.ram)}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Cpu} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Процессор:&nbsp;
                        </Text>
                        <Text variant="body-1" color="primary">
                            {clusterPreset.vcpu} milliCPU
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Database} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Хранилище:&nbsp;
                        </Text>
                        <Text variant="body-1" color="primary">
                            {resources?.storageClass ?? '???'}&nbsp;
                            {resources?.storage
                                ? `${resources.storage / BytesGB.coefficient} ${BytesGB.label}`
                                : '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Circles5Random} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Реплики:&nbsp;
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
