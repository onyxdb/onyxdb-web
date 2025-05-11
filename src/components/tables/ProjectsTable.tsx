'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Icon,
    Label,
    Link,
    Table,
    TableColumnConfig,
    Text,
    withTableSorting,
} from '@gravity-ui/uikit';
import {ProductDTO, ProjectDTO} from '@/generated/api';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '../Layout/HorizontalStack';
import {TextWithCopy} from '@/components/common/TextWithCopy';
import {Pencil} from '@gravity-ui/icons';
import {productsApi} from '@/app/apis';

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
    const [productCache, setProductCache] = useState<{[key: string]: ProductDTO | null}>({});
    const {checkPermission} = useAuth();

    const fetchProducts = async () => {
        const prdIds = new Set<string>();
        projects.forEach((prj) => {
            if (prj.productId) prdIds.add(prj.productId);
        });

        const prdPromises = Array.from(prdIds).map(async (prdId) => {
            try {
                const response = await productsApi.getProductById({productId: prdId});
                return {id: prdId, data: response.data};
            } catch (error) {
                console.error(`Error fetching user with id ${prdId}:`, error);
                return {id: prdId, data: null};
            }
        });

        const prdData = await Promise.all(prdPromises);
        const prdMap: {[key: string]: ProductDTO | null} = {};
        prdData.forEach((prd) => {
            prdMap[prd.id] = prd.data;
        });
        setProductCache(prdMap);
    };

    useEffect(() => {
        fetchProducts();
    }, [projects.length]);

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
                    {project.name} {project.isDeleted && <Label theme="warning">Архив</Label>}
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
            id: 'product',
            name: 'Продукт',
            template: (item) => {
                const prd = productCache[item.productId];
                if (!prd) {
                    return <TextWithCopy text={item.productId} maxLength={8} />;
                }
                return <Link href={`/products/view/${prd.id}`}>{prd.name}</Link>;
            },
            meta: {
                sort: true,
            },
        },
        {
            id: 'namespace',
            name: 'Неймспейс',
            template: (item) => <Text>{item.namespace}</Text>,
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
                    {checkPermission('project', 'delete', project.id) && project.isDeleted && (
                        <Button view="normal" size="m" onClick={() => onUnarchive?.(project.id)}>
                            Переоткрыть
                        </Button>
                    )}
                    {checkPermission('project', 'delete', project.id) && !project.isDeleted && (
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
