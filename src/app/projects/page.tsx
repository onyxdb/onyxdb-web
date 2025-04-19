// pages/projects/index.tsx
'use client';
import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Text, TextInput} from '@gravity-ui/uikit';
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
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ProjectsTable} from '@/components/tables/ProjectsTable';
import {ProductSelector} from '@/components/ProductSelector';
import {ProductDTO} from '@/generated/api';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<V1ProjectResponse[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<V1ProjectResponse[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [editingProject, setEditingProject] = useState<V1ProjectResponse | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showArchived, setShowArchived] = useState<boolean>(false);
    const [productId, setProductId] = useState<string | null>(null);
    const {checkPermission} = useAuth();

    const fetchProjects = async () => {
        try {
            const response = await mdbProjectsApi.listProjects();
            setProjects(response.data.projects);
            setFilteredProjects(response.data.projects);
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

    const handleArchive = async (id: string) => {
        try {
            await mdbProjectsApi.archiveProject({projectId: id});
            await fetchProjects();
        } catch (error) {
            console.error('Error Archiving projects:', error);
        }
    };

    const handleUnArchive = async (id: string) => {
        try {
            await mdbProjectsApi.unarchiveProject({projectId: id});
            await fetchProjects();
        } catch (error) {
            console.error('Error unArchiving projects:', error);
        }
    };

    const handleProductSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const fetchFilteredProjects = () => {
        const filtered = projects
            .filter(
                (p) =>
                    searchQuery.length === 0 ||
                    p.id === searchQuery ||
                    p.name.includes(searchQuery) ||
                    p.description.includes(searchQuery),
            )
            .filter((p) => showArchived || !p.isArchived)
            .filter((p) => productId === null || p.productId === productId);
        setFilteredProjects(filtered);
    };

    useEffect(() => {
        fetchFilteredProjects();
    }, [searchQuery, showArchived, productId]);

    const handleProductSelect = (data: ProductDTO) => {
        if (data.id) {
            setProductId(data.id);
            fetchFilteredProjects();
        }
    };

    const handleShowArchivedChange = (checked: boolean) => {
        setShowArchived(checked);
        fetchFilteredProjects();
    };

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
                <HorizontalStack align="center" gap={10}>
                    <TextInput
                        name="product"
                        value={searchQuery}
                        placeholder="Введите и выберите продукт"
                        onUpdate={handleProductSearchChange}
                    />
                    <Button view="action" size="m" onClick={fetchFilteredProjects}>
                        Поиск
                    </Button>
                </HorizontalStack>
                <Box marginTop={16} marginBottom={16}>
                    <Checkbox size="l" checked={showArchived} onUpdate={handleShowArchivedChange}>
                        Показывать архивные проекты
                    </Checkbox>
                </Box>
                <ProductSelector selectProductAction={handleProductSelect} />
                <ProjectsTable
                    projects={filteredProjects}
                    onEdit={handleOpenEditModal}
                    onArchive={handleArchive}
                    onUnarchive={handleUnArchive}
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
