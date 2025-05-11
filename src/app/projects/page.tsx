'use client';

import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {
    CreateProjectRequestDTO,
    ProductDTO,
    ProjectDTO,
    UpdateProjectRequestDTO,
} from '@/generated/api';
import {mdbProjectsApi} from '@/app/apis';
import {ProjectForm} from '@/components/forms/ProjectForm';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {CirclePlus} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ProjectsTable} from '@/components/tables/ProjectsTable';
import {ProductSelector} from '@/components/formik/ProductSelector';
import {ProjectBlock} from '@/components/ProjectBlock';
import {useSearchParams} from 'next/navigation';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<ProjectDTO[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [selectedProject, setSelectedProject] = useState<ProjectDTO | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showArchived, setShowArchived] = useState<boolean>(false);
    const [productId, setProductId] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const {checkPermission} = useAuth();

    const prjIdFromPath = searchParams.get('prjId');

    const handleOpenViewModal = (project: ProjectDTO) => {
        setSelectedProject(project);
        setIsViewModalOpen(true);
    };

    const handleCloseViewModal = () => {
        setIsViewModalOpen(false);
    };

    const fetchProjects = async () => {
        try {
            const response = await mdbProjectsApi.listProjects();
            setProjects(response.data.projects);
            setFilteredProjects(response.data.projects);

            if (prjIdFromPath) {
                const prjPreSelected = response.data.projects.find((p) => p.id === prjIdFromPath);
                if (prjPreSelected) {
                    handleOpenViewModal(prjPreSelected);
                }
            }
        } catch (error) {
            console.error('Error fetching clusters:', error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = (project: CreateProjectRequestDTO) => {
        mdbProjectsApi
            .createProject({createProjectRequestDTO: project})
            .then(() => {
                fetchProjects();
                setIsCreateModalOpen(false);
            })
            .catch((error) => console.error('Error creating project:', error));
    };

    const handleEditProject = (project: UpdateProjectRequestDTO) => {
        if (selectedProject?.id) {
            mdbProjectsApi
                .updateProject({projectId: selectedProject.id, updateProjectRequestDTO: project})
                .then(() => {
                    fetchProjects();
                    setIsEditModalOpen(false);
                })
                .catch((error) =>
                    console.error('Error updating project:', selectedProject.id, error),
                );
        }
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleOpenEditModal = (project: ProjectDTO) => {
        setSelectedProject(project);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProject(null);
    };

    const handleArchive = async (id: string) => {
        try {
            await mdbProjectsApi.deleteProject({projectId: id});
            await fetchProjects();
            setIsViewModalOpen(false);
        } catch (error) {
            console.error('Error Archiving projects:', error);
        }
    };

    const handleUnArchive = async (id: string) => {
        try {
            await mdbProjectsApi.deleteProject({projectId: id});
            await fetchProjects();
            setIsViewModalOpen(false);
        } catch (error) {
            console.error('Error unArchiving projects:', error);
        }
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
            .filter((p) => showArchived || !p.isDeleted)
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
            icon: CirclePlus,
        });
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <Text variant="body-1">Поиск проекта</Text>
                <div style={{maxWidth: '350px'}}>
                    <HorizontalStack align="center" gap={10}>
                        <TextInput
                            name="project"
                            value={searchQuery}
                            placeholder="Введите текст"
                            onUpdate={(value) => setSearchQuery(value)}
                        />
                        <Button view="action" size="m" onClick={fetchFilteredProjects}>
                            Поиск
                        </Button>
                    </HorizontalStack>
                </div>
                <div style={{maxWidth: '350px', marginTop: '16px'}}>
                    <ProductSelector selectProductAction={handleProductSelect} />
                </div>
                <Box marginTop={16} marginBottom={16}>
                    <Checkbox size="l" checked={showArchived} onUpdate={handleShowArchivedChange}>
                        Показывать архивные проекты
                    </Checkbox>
                </Box>
                <ProjectsTable
                    projects={filteredProjects}
                    onView={handleOpenViewModal}
                    onEdit={handleOpenEditModal}
                    onArchive={handleArchive}
                    onUnarchive={handleUnArchive}
                />
                <Modal open={isViewModalOpen} onOpenChange={handleCloseViewModal}>
                    {selectedProject && (
                        <ProjectBlock
                            data={selectedProject}
                            archiveAction={handleArchive}
                            unArchiveAction={handleUnArchive}
                        />
                    )}
                </Modal>
                <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                    <ProjectForm
                        closeAction={handleCloseCreateModal}
                        submitAction={handleCreateProject}
                    />
                </Modal>
                <Modal open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                    {selectedProject && (
                        <ProjectForm
                            closeAction={handleCloseEditModal}
                            submitAction={handleEditProject}
                            initialValue={selectedProject}
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
}
