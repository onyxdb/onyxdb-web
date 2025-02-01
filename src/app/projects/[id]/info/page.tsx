'use client';

import React, {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {ProjectDTO, ProjectsApi} from '@/generated/api';

export default function ProjectInfoPage() {
    const params = useParams();
    const projectId = params.id as string;
    const [project, setProject] = useState<ProjectDTO | null>(null);

    useEffect(() => {
        const projectsApi = new ProjectsApi();
        projectsApi
            .getProjectById({projectId})
            .then((response) => setProject(response.data))
            .catch((error) => console.error('Error fetching project:', error));
    }, [projectId]);

    if (!project) {
        return <div>Загрузка...</div>;
    }

    return (
        <div style={{padding: '20px'}}>
            <h1>{project.name}</h1>
            <p>{project.description}</p>
            <p>Дата создания: {project.createdAt}</p>
            <p>Владелец: {project.ownerId}</p>
        </div>
    );
}
