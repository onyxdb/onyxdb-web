'use client';

import React, {useEffect, useState} from 'react';
import {Button, Card, Checkbox, Label, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {ProjectDTO} from '@/generated/api';
import {mdbProjectsApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface ProjectSelectorProps {
    initialValueId?: string;
    selectProjectAction: (project: ProjectDTO) => void;
    header?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
    initialValueId,
    selectProjectAction,
    header = 'Поиск проекта',
    label = 'Проект',
    placeholder = 'Введите и выберите проект',
    disabled,
}) => {
    const [projectsAll, setProjectsAll] = useState<ProjectDTO[]>([]);
    const [projectOptions, setProjectOptions] = useState<ProjectDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>(initialValueId ?? '');
    const [showArchived, setShowArchived] = useState<boolean>(false);
    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);

    const handleProjectSelect = (data: ProjectDTO) => {
        setIsProjectsModalOpen(false);
        selectProjectAction(data);
        setSearchQuery(data.name);
    };

    const fetchProjectsAll = async () => {
        try {
            const response = await mdbProjectsApi.listProjects();
            setProjectsAll(response.data.projects ?? []);
            if (initialValueId) {
                const initial = response.data.projects.find((e) => e.id === initialValueId);
                if (initial) {
                    handleProjectSelect(initial);
                }
            }
            // console.log('fetchProjectsAll', response.data.projects);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const fetchProjectOptions = async () => {
        const filteredProjects = projectsAll
            .filter(
                (p) =>
                    searchQuery.length === 0 ||
                    p.id === searchQuery ||
                    p.name.includes(searchQuery) ||
                    p.description.includes(searchQuery),
            )
            .filter((p) => showArchived || !p.isArchived);
        setProjectOptions(filteredProjects);
    };

    useEffect(() => {
        fetchProjectsAll();
    }, []);

    useEffect(() => {
        fetchProjectOptions();
    }, [projectsAll.length, searchQuery, showArchived]);

    const handleProjectSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleOpenProjectsModal = () => {
        setIsProjectsModalOpen(true);
    };

    const handleCloseProjectsModal = () => {
        setIsProjectsModalOpen(false);
    };

    if (disabled) {
        return (
            <div style={{marginBottom: '20px'}}>
                <Text>{label}</Text>
                <TextInput value={searchQuery} disabled={disabled} />
            </div>
        );
    }

    return (
        <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px'}}>{label}</label>
            <HorizontalStack align="center" gap={10}>
                <TextInput
                    name="project"
                    value={searchQuery}
                    placeholder={placeholder}
                    onUpdate={handleProjectSearchChange}
                />
                <Button view="action" size="m" onClick={handleOpenProjectsModal}>
                    Поиск
                </Button>
            </HorizontalStack>
            <Box marginTop={10}>
                <Checkbox
                    size="l"
                    checked={showArchived}
                    onUpdate={(checked) => setShowArchived(checked)}
                >
                    Показывать архивные проекты
                </Checkbox>
            </Box>
            <Modal open={isProjectsModalOpen} onOpenChange={handleCloseProjectsModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">{header}</Text>
                    <Box marginTop="10px">
                        {projectOptions.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => handleProjectSelect(item)}
                                style={{marginBottom: '10px', padding: '16px'}}
                            >
                                <HorizontalStack justify="space-between">
                                    <Text variant="header-1" style={{marginRight: '10px'}}>
                                        {item.name}
                                    </Text>
                                    {item.isArchived && <Label theme="warning">Архив</Label>}
                                </HorizontalStack>
                                <Box>
                                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                        {item.description}
                                    </Text>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Button view="normal" onClick={handleCloseProjectsModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
