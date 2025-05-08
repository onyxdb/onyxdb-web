'use client';

import React from 'react';
import {Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {MongoHost} from '@/generated/api';

interface HostsTableProps {
    hosts: MongoHost[];
}

export const HostsTable: React.FC<HostsTableProps> = ({hosts}) => {
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
            template: (host) => host.type.toLocaleUpperCase(),
            meta: {
                sort: true,
            },
        },
        {
            id: 'role',
            name: 'Роль',
            template: (host) => host.role.toLocaleUpperCase(),
            meta: {
                sort: true,
            },
        },
        {
            id: 'status',
            name: 'Статус',
            template: (host) => host.status.toLocaleUpperCase(),
            meta: {
                sort: true,
            },
        },
    ];

    return (
        <div>
            <MyTable
                width="max"
                data={hosts}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};
