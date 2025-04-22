'use client';

import React from 'react';
import {Button, Table, TableColumnConfig, Text, withTableSorting} from '@gravity-ui/uikit';
import {MongoBackup} from '@/generated/api-mdb';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface BackupsTableProps {
    clusterId: string;
    backups: MongoBackup[];
    deleteAction: (backupName: string) => void;
    restoreAction: (backupName: string) => void;
}

export const BackupsTable: React.FC<BackupsTableProps> = ({
    backups,
    clusterId,
    deleteAction,
    restoreAction,
}) => {
    const {checkPermission} = useAuth();

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<MongoBackup>[] = [
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
            id: 'startedAt',
            name: 'Начало',
            meta: {
                sort: true,
            },
            template: (backup) => (
                <Text variant="subheader-1" color="secondary">
                    {new Date(backup.startedAt).toLocaleString()}
                </Text>
            ),
        },
        {
            id: 'finishedAt',
            name: 'Окончание',
            meta: {
                sort: true,
            },
            template: (backup) => (
                <Text variant="subheader-1" color="secondary">
                    {backup.finishedAt
                        ? new Date(backup.finishedAt).toLocaleString()
                        : 'В процессе'}
                </Text>
            ),
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (backup) => (
                <HorizontalStack gap={10}>
                    {checkPermission('cluster', 'backup', clusterId) && (
                        <Button view="outlined" size="m" onClick={() => deleteAction(backup.name)}>
                            Удалить
                        </Button>
                    )}
                    {checkPermission('cluster', 'backup', clusterId) && (
                        <Button view="outlined" size="m" onClick={() => restoreAction(backup.name)}>
                            Восстановить
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
                data={backups}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};
