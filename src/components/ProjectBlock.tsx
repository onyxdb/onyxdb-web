'use client';

import React from 'react';
import {Button, Card, Icon, Label, Text} from '@gravity-ui/uikit';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ArrowUpFromSquare, Pencil, TrashBin} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {ProjectDTO} from '@/generated/api';
import ClustersTable from '@/components/tables/ClustersTable';
import {Box} from '@/components/Layout/Box';

interface ProjectBlockProps {
    data: ProjectDTO;
    archiveAction: (id: string) => void;
    unArchiveAction: (id: string) => void;
    onEdit?: (project: ProjectDTO) => void;
}

export const ProjectBlock: React.FC<ProjectBlockProps> = ({data, archiveAction, unArchiveAction, onEdit}) => {
    const {checkPermission} = useAuth();

    return (
        <Card style={{padding: '16px'}}>
            <HorizontalStack justify="space-between">
                <VerticalStack>
                    <Text variant="subheader-3">
                        {data.name} {data.isDeleted && <Label theme="warning">Архив</Label>}
                    </Text>
                    <Text variant="subheader-1" color="secondary">
                        {data.description?.split(' ').slice(0, 5).join(' ')}
                    </Text>
                </VerticalStack>
                <div style={{flexDirection: 'row'}}>
                    {(checkPermission('product', 'edit', data.productId) || checkPermission('project', 'edit')) && (
                        <Box marginBottom="5px">
                            <Button view="normal" size="m" onClick={() => onEdit && onEdit(data)}>
                                <Icon data={Pencil} />
                            </Button>
                        </Box>
                    )}
                    {(checkPermission('product', 'delete', data.productId) || checkPermission('project', 'delete')) && data.isDeleted ? (
                        <Button view="outlined-danger" size="m" onClick={() => unArchiveAction(data.id)}>
                            <Icon data={ArrowUpFromSquare} />
                        </Button>
                    ) : (
                        <Button view="outlined-danger" size="m" onClick={() => archiveAction(data.id)}>
                            <Icon data={TrashBin} />
                        </Button>
                    )}
                </div>
            </HorizontalStack>
            <ClustersTable projectsIds={[data.id]} />
        </Card>
    );
};
