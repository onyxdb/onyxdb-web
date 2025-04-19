'use client';

import React from 'react';
import {Button, Label, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {V1ProjectResponse} from '@/generated/api-mdb';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '../Layout/HorizontalStack';

interface ProjectsTableProps {
    projects: V1ProjectResponse[];
    onEdit?: (project: V1ProjectResponse) => void;
    onArchive?: (id: string) => void;
    onUnarchive?: (id: string) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
    projects,
    onEdit,
    onArchive,
    onUnarchive,
}) => {
    const router = useRouter();
    const {checkPermission} = useAuth();

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<V1ProjectResponse>[] = [
        {
            id: 'name',
            name: 'Название',
            template: (project) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/projects/view/${project.id}`)}
                >
                    {project.name} {project.isArchived && <Label theme="warning">Архив</Label>}
                </span>
            ),
            meta: {
                sort: true,
            },
        },
        {
            id: 'description',
            name: 'Описание',
        },
        {
            id: 'productId',
            name: 'ID продукта',
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (project) => (
                <HorizontalStack gap={10}>
                    {checkPermission('project', 'edit', project.id) && (
                        <Button view="normal" size="m" onClick={() => onEdit?.(project)}>
                            Редактировать
                        </Button>
                    )}
                    {checkPermission('project', 'delete', project.id) && project.isArchived && (
                        <Button view="normal" size="m" onClick={() => onUnarchive?.(project.id)}>
                            Переоткрыть
                        </Button>
                    )}
                    {checkPermission('project', 'delete', project.id) && !project.isArchived && (
                        <Button view="normal" size="m" onClick={() => onArchive?.(project.id)}>
                            Архивировать
                        </Button>
                    )}
                </HorizontalStack>
            ),
        },
    ];

    return (
        <MyTable
            width="max"
            data={projects}
            // @ts-ignore
            columns={columns}
        />
    );
};
