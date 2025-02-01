'use client';

import React, {useEffect, useState} from 'react';
import {Table, TableColumnConfig, TextInput} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProjectDTO} from '@/generated/api';
import {projectsApi} from '@/app/apis';

export default function ProjectsPage() {
    const router = useRouter();
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sorting] = useState<{column: string; order: 'asc' | 'desc'}>({
        column: 'name',
        order: 'asc',
    });

    useEffect(() => {
        projectsApi
            .getAllProjects()
            .then((response) => setProjects(response.data))
            .catch((error) => console.error('Error fetching projects:', error));
    }, []);

    const filteredProjects = projects.filter((project) =>
        project.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const sortedProjects = filteredProjects.sort((a, b) => {
        const column = sorting.column as keyof ProjectDTO;
        if (a[column]! < b[column]!) return sorting.order === 'asc' ? -1 : 1;
        if (a[column]! > b[column]!) return sorting.order === 'asc' ? 1 : -1;
        return 0;
    });

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

    // Обработчик сортировки
    // const handleSort = (column: string, order: 'asc' | 'desc') => {
    //     setSorting({column, order});
    // };

    return (
        <div style={{padding: '20px'}}>
            <h1>Каталог проектов</h1>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по названию"
                    value={searchQuery}
                    onUpdate={(value) => setSearchQuery(value)}
                />
            </div>
            <Table
                data={sortedProjects}
                columns={columns}
                // onSort={(column: string, order: 'asc' | 'desc') => handleSort(column, order)}
                // sortState={sorting}
            />
        </div>
    );
}
