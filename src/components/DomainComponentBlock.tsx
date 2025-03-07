'use client';

import React from 'react';
import {Button, Card} from '@gravity-ui/uikit';
import {OrganizationUnitDTO} from '@/generated/api';
import {Pencil} from '@gravity-ui/icons';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {Spacer} from '@/components/Layout/Spacer';
import {OrgUnitBlock} from '@/components/OrgUnitBlockSmall';

interface DomainComponentProps {
    id: string;
    name: string;
    roots: OrganizationUnitDTO[];
    onEdit: (id: string) => void;
}

export const DomainComponentBlock: React.FC<DomainComponentProps> = ({id, name, roots, onEdit}) => {
    const handleEdit = () => {
        onEdit(id);
    };

    return (
        <Card style={{marginBottom: '20px', width: '300px'}}>
            <div style={{padding: '16px'}}>
                <HorizontalStack align="center">
                    <div style={{fontWeight: 'bold'}}>
                        <h2>{name}</h2>
                    </div>
                    <Spacer />
                    <Button view="normal" size="m" onClick={handleEdit}>
                        <Pencil />
                    </Button>
                </HorizontalStack>
                <Box marginBottom="12px">
                    {roots.map((root) => (
                        <OrgUnitBlock data={root} />
                    ))}
                </Box>
            </div>
        </Card>
    );
};
