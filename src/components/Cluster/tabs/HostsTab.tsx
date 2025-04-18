'use client';

import React from 'react';
import {Table, TableColumnConfig, Text, withTableSorting} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {MongoHost} from '@/generated/api-mdb';

interface HostsTabProps {
    hosts: MongoHost[];
}

const HostsTab: React.FC<HostsTabProps> = ({hosts}) => {
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
            <Text variant="header-2">Хосты кластера</Text>
            <Box marginTop="10px">
                <MyTable
                    width="max"
                    data={hosts}
                    // @ts-ignore
                    columns={columns}
                />
            </Box>
        </div>
    );
};

export default HostsTab;
