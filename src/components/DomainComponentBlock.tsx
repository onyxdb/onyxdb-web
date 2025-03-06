'use client';

import React from 'react';
import {Button, Card} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {OrganizationUnitDTO} from '@/generated/api';
import {ArrowRightFromLine, Pencil} from '@gravity-ui/icons';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

interface DomainComponentProps {
    id: string;
    name: string;
    roots: OrganizationUnitDTO[];
    onEdit: (id: string) => void;
}

export const DomainComponentBlock: React.FC<DomainComponentProps> = ({id, name, roots, onEdit}) => {
    const router = useRouter();

    const handleEdit = () => {
        onEdit(id);
    };

    const handleViewDetails = (ouId: string) => {
        router.push(`/org/view/${ouId}`);
    };

    return (
        <Card style={{marginBottom: '20px', width: '300px'}}>
            <div style={{padding: '16px'}}>
                <div style={{marginBottom: '12px', fontWeight: 'bold'}}>
                    <h2>{name}</h2>
                </div>
                <Box marginBottom="12px">
                    {roots.map((root) => (
                        <div
                            key={root.id}
                            style={{marginBottom: '8px', cursor: 'pointer'}}
                            onClick={() => handleViewDetails(root.id ?? '???')}
                        >
                            <HorizontalStack align="center">
                                <ArrowRightFromLine />
                                <Box marginLeft="5px">
                                    <div>Название: {root.name}</div>
                                    <div>Владелец: {root.ownerId}</div>
                                </Box>
                            </HorizontalStack>
                        </div>
                    ))}
                </Box>
                <div
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                >
                    <Button view="normal" size="m" onClick={() => router.push(`/dc/create`)}>
                        Создать OU
                    </Button>
                    <Button view="normal" size="m" onClick={handleEdit}>
                        <Pencil />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
