'use client';

import React, {useEffect, useState} from 'react';
import {Button, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {MongoHost} from '@/generated/api-mdb';
import {mdbManagedMongoDbApi} from '@/app/apis';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface HostsTabProps {
    clusterId: string;
}

const HostsTab: React.FC<HostsTabProps> = ({clusterId}) => {
    const [clusterHosts, setClusterHosts] = useState<MongoHost[]>([]);

    const fetchData = async () => {
        try {
            const hostsResponse = await mdbManagedMongoDbApi.listHosts({clusterId});
            setClusterHosts(hostsResponse.data.hosts);
        } catch (error) {
            console.error('Error fetching cluster:', error);
        }
    };
    useEffect(() => {
        fetchData();
    }, [clusterId]);

    const MyTable = withTableSorting(Table);

    const columns: TableColumnConfig<MongoHost>[] = [
        {
            id: 'name',
            name: 'Название',
            meta: {
                sort: true,
            },
        },
        {
            id: 'type',
            name: 'Тип',
            meta: {
                sort: true,
            },
        },
        {
            id: 'status',
            name: 'Статус',
            meta: {
                sort: true,
            },
        },
        {
            id: 'role',
            name: 'Роль',
            meta: {
                sort: true,
            },
        },
    ];

    return (
        <div>
            <HorizontalStack gap={10}>
                <Button></Button>
            </HorizontalStack>
            <Box marginTop="20px">
                <MyTable
                    width="max"
                    data={clusterHosts}
                    // @ts-ignore
                    columns={columns}
                />
            </Box>
        </div>
    );
};

export default HostsTab;
