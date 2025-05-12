'use client';

import React from 'react';
import {Button, Icon, Table, TableColumnConfig, Text, withTableSorting} from '@gravity-ui/uikit';
import {MongoBackupDTO} from '@/generated/api';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {TrashBin} from '@gravity-ui/icons';

interface BackupsTableProps {
    clusterId: string;
    backups: MongoBackupDTO[];
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
    const columns: TableColumnConfig<MongoBackupDTO>[] = [
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
            template: (backup) => (
                <Text variant="subheader-1" color="secondary">
                    {backup.type.displayValue ?? backup.type.value}
                </Text>
            ),
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
                    {backup.isReady && checkPermission('cluster', 'backup', clusterId) && (
                        <Button
                            view="outlined-success"
                            size="m"
                            onClick={() => restoreAction(backup.name)}
                        >
                            Восстановить
                        </Button>
                    )}
                    {backup.isReady && checkPermission('cluster', 'backup', clusterId) && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => deleteAction(backup.name)}
                        >
                            <Icon data={TrashBin} />
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
                data={backups}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};
