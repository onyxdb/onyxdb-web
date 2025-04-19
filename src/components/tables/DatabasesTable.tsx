'use client';

import React from 'react';
import {Button, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {MongoDatabase} from '@/generated/api-mdb';

interface DatabasesTableProps {
    databases: MongoDatabase[];
    deleteAction: (databaseId: string) => void;
}

export const DatabasesTable: React.FC<DatabasesTableProps> = ({databases, deleteAction}) => {
    const {checkPermission} = useAuth();

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<MongoDatabase>[] = [
        {
            id: 'name',
            name: 'Название',
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (database) => (
                <HorizontalStack gap={10}>
                    {checkPermission('database', 'delete', database.id) && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => deleteAction(database.id)}
                        >
                            Удалить
                        </Button>
                    )}
                </HorizontalStack>
            ),
        },
    ];

    return (
        <div>
            <MyTable
                width="max"
                data={databases}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};
