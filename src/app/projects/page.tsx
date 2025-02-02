'use client';

import React, {useEffect, useState} from 'react';
import {Button, Table, TableColumnConfig, TextInput, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProjectDTO} from '@/generated/api';
import {projectsApi} from '@/app/apis';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        projectsApi
            .getAllProjects()
            .then((response) => setProjects(response.data))
            .catch((error) => console.error('Error fetching projects:', error));
    }, []);

    const MyTable = withTableSorting(Table);

    const columns: TableColumnConfig<ProjectDTO>[] = [
        {
            id: 'name',
            name: 'Название',
            template: (project) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/projects/${project.id}/info`)}
                >
                    {project.name}
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
            id: 'createdAt',
            name: 'Дата создания',
            meta: {
                sort: true,
            },
        },
        {
            id: 'ownerId',
            name: 'Владелец',
            template: (project) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/accounts/${project.ownerId}/info`)}
                >
                    {project.ownerId}
                </span>
            ),
        },
    ];

    const handleCreateProject = () => {
        router.push('/projects/create');
    };

    return (
        <div style={{padding: '20px'}}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h1>Каталог проектов</h1>
                <Button view="action" size="l" onClick={handleCreateProject}>
                    Создать проект
                </Button>
            </div>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по названию"
                    value={searchQuery}
                    onUpdate={(value) => setSearchQuery(value)}
                />
            </div>
            <MyTable
                data={projects}
                columns={columns}
                // onSort={(column: string, order: 'asc' | 'desc') => handleSort(column, order)}
                // sortState={sorting}
            />
        </div>
    );
}
