'use client';

import React, {useEffect, useState} from 'react';
import {Button, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {Box} from '@/components/Layout/Box';

interface ClusterDTO {
    name: string;
    type: string;
    id: string;
    author: string;
    createdAt: string;
    availability: string;
}

export interface ClustersTableProps {
    projectId: string;
}

export const ClustersTable: React.FC<ClustersTableProps> = ({projectId}) => {
    const [clusters, setClusters] = useState<ClusterDTO[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchClusters = async () => {
            try {
                // const clustersResponse = await mdbProjectsApi.getClustersByProjectId({
                //     projectId: projectId,
                // });
                const clustersResponse = {
                    data: {
                        clusters: [
                            {
                                name: 'mongo1',
                                type: 'MongoDB',
                                id: '16ee82fe-e6e6-4d91-81f8-15edbae94826',
                                author: 'ao.fedorov',
                                createdAt: '2025-02-02',
                                availability: 'good',
                            },
                            {
                                name: 'postgres1',
                                type: 'PostgreSQL',
                                id: 'e1c74ac3-d0c5-4ebf-8402-a23b44016f92',
                                author: 'sa.mokhov',
                                createdAt: '2024-12-31',
                                availability: 'down',
                            },
                        ],
                    },
                };
                setClusters(clustersResponse.data.clusters ?? []);
            } catch (error) {
                console.error('Error fetching clusters:', error);
            }
        };

        fetchClusters();
    }, [projectId]);

    const columns: TableColumnConfig<ClusterDTO>[] = [
        {
            id: 'name',
            name: 'Имя',
            template: (cluster) => cluster.name,
            meta: {
                sort: true,
            },
        },
        {
            id: 'type',
            name: 'Тип',
            template: (cluster) => cluster.type,
            meta: {
                sort: true,
            },
        },
        {
            id: 'id',
            name: 'Идентификатор',
            template: (cluster) => cluster.id,
            meta: {
                sort: true,
            },
        },
        {
            id: 'author',
            name: 'Автор',
            template: (cluster) => cluster.author,
            meta: {
                sort: true,
            },
        },
        {
            id: 'createdAt',
            name: 'Дата создания',
            template: (cluster) => cluster.createdAt,
            meta: {
                sort: true,
            },
        },
        {
            id: 'availability',
            name: 'Доступность',
            template: (cluster) => (cluster.availability ? 'Доступен' : 'Не доступен'),
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (cluster) => (
                <div style={{display: 'flex', gap: '10px'}}>
                    <Button
                        view="normal"
                        size="m"
                        onClick={() => router.push(`/clusters/view/${cluster.id}`)}
                    >
                        Просмотр
                    </Button>
                </div>
            ),
        },
    ];

    const MyTable = withTableSorting(Table);

    return (
        <div>
            <Box marginBottom="20px" marginTop="20px">
                <Button
                    view="action"
                    size="l"
                    onClick={() => router.push(`/clusters/create?prId=${projectId}`)}
                >
                    Создать новый кластер
                </Button>
            </Box>
            <MyTable
                data={clusters}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};

export default ClustersTable;
