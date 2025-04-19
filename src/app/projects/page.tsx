// pages/projects/index.tsx
'use client';
import React, {useEffect, useState} from 'react';
import {Button, Table, TableColumnConfig, Text, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {
    V1CreateProjectRequest,
    V1ProjectResponse,
    V1UpdateProjectRequest,
} from '@/generated/api-mdb';
import {mdbProjectsApi} from '@/app/apis';
import {ProjectForm} from '@/components/forms/ProjectForm';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {CirclePlus} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {Box} from '@/components/Layout/Box';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<V1ProjectResponse[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<V1ProjectResponse | null>(null);
    const router = useRouter();
    const {checkPermission} = useAuth();

    const fetchProjects = async () => {
        try {
            const response = await mdbProjectsApi.listProjects();
            console.log('listProjects', response.data.projects);
            setProjects(response.data.projects);
        } catch (error) {
            console.error('Error fetching clusters:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = (project: V1CreateProjectRequest) => {
        mdbProjectsApi
            .createProject({v1CreateProjectRequest: project})
            .then(() => {
                fetchProjects();
                setIsCreateModalOpen(false);
            })
            .catch((error) => console.error('Error creating project:', error));
    };

    const handleEditProject = (project: V1UpdateProjectRequest) => {
        if (editingProject?.id) {
            mdbProjectsApi
                .updateProject({projectId: editingProject.id, v1UpdateProjectRequest: project})
                .then(() => {
                    fetchProjects();
                    setIsEditModalOpen(false);
                })
                .catch((error) =>
                    console.error('Error updating project:', editingProject.id, error),
                );
        }
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleOpenEditModal = (project: V1ProjectResponse) => {
        setEditingProject(project);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProject(null);
    };

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
            id: 'productId',
            name: 'Проект',
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (project) => (
                <Button view="normal" size="m" onClick={() => handleOpenEditModal(project)}>
                    Редактировать
                </Button>
            ),
        },
    ];

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/projects', text: 'Проекты'},
    ];

    const actions = [];
    if (checkPermission('project', 'create')) {
        actions.push({
            text: 'Создать проект',
            action: handleOpenCreateModal,
            icon: <CirclePlus />,
        });
    }

    return (
        <div>
            <AppHeader breadCrumps={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Каталог проектов</Text>
                </Box>
                <MyTable
                    width="max"
                    data={projects}
                    // @ts-ignore
                    columns={columns}
                />
                {isCreateModalOpen && (
                    <ProjectForm
                        closeAction={handleCloseCreateModal}
                        submitAction={handleCreateProject}
                    />
                )}
                {isEditModalOpen && editingProject && (
                    <ProjectForm
                        closeAction={handleCloseEditModal}
                        submitAction={handleEditProject}
                        initialValue={editingProject}
                    />
                )}
            </div>
        </div>
    );
}
