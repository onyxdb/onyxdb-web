'use client';

import React from 'react';
import {Button, Card, Icon, Text} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {OrganizationUnitDTO} from '@/generated/api';
import {Eye} from '@gravity-ui/icons';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {Box} from '@/components/Layout/Box';

interface OrganizationUnitSmallCardProps {
    orgUnit: OrganizationUnitDTO;
    onSelect: (ou: OrganizationUnitDTO) => void;
}

export const OrganizationUnitSmallCard: React.FC<OrganizationUnitSmallCardProps> = ({
    orgUnit,
    onSelect,
}) => {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/structure/view/${orgUnit.id}`);
    };

    return (
        <Card
            type="selection"
            style={{marginBottom: '10px', padding: '10px'}}
            onClick={() => onSelect(orgUnit)}
        >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <VerticalStack>
                    <Text variant="subheader-3">{orgUnit.name}</Text>
                    <Text variant="subheader-1" color="secondary">
                        {orgUnit.description?.split(' ').slice(0, 5).join(' ')}
                    </Text>
                </VerticalStack>
                <Box marginLeft="10px" marginRight="10px">
                    {orgUnit.ownerId && <UserBlockWithFetch accountId={orgUnit.ownerId} size="s" />}
                </Box>
                <Button view="normal" size="m" onClick={handleViewDetails}>
                    <Icon data={Eye} />
                </Button>
            </div>
        </Card>
    );
};
