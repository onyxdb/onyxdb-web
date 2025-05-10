'use client';

import React from 'react';
import {Button, Icon, Label, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {ProjectDTO} from '@/generated/api';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '../Layout/HorizontalStack';
import {TextWithCopy} from '@/components/TextWithCopy';
import {Pencil} from '@gravity-ui/icons';

interface ProjectsTableProps {
    projects: ProjectDTO[];
    onView?: (project: ProjectDTO) => void;
    onEdit?: (project: ProjectDTO) => void;
    onArchive?: (id: string) => void;
    onUnarchive?: (id: string) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
    projects,
    onView,
    onEdit,
    onArchive,
    onUnarchive,
}) => {
    const {checkPermission} = useAuth();

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<ProjectDTO>[] = [
        {
            id: 'id',
            name: 'Id',
            template: (item) => <TextWithCopy text={item.id} maxLength={8} />,
        },
        {
            id: 'name',
            name: 'Название',
            template: (project) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => onView?.(project)}
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
            name: 'Продукт',
            template: (item) => <TextWithCopy text={item.productId} maxLength={8} />,
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
                            <Icon data={Pencil} />
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
