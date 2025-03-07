'use client';

import React, {useEffect, useState} from 'react';
import {Button, Card, Text, User} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {AccountDTO, OrganizationUnitDTO} from '@/generated/api';
import {Eye} from '@gravity-ui/icons';
import {accountsApi} from '@/app/apis';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {Box} from '@/components/Layout/Box';

interface OrganizationUnitSmallCardProps {
    orgUnit: OrganizationUnitDTO;
    onSelect: (ouId: OrganizationUnitDTO) => void;
}

export const OrganizationUnitSmallCard: React.FC<OrganizationUnitSmallCardProps> = ({
    orgUnit,
    onSelect,
}) => {
    const router = useRouter();

    const [owner, setOwner] = useState<AccountDTO | null>(null);

    useEffect(() => {
        if (orgUnit.ownerId) {
            accountsApi
                .getAccountById({accountId: orgUnit.ownerId})
                .then((response) => setOwner(response.data))
                .catch((error) => console.error('Error fetching account:', error));
        } else {
            setOwner({
                username: '???',
                email: '???',
                firstName: 'Not',
                lastName: 'Stated',
            });
        }
    }, [orgUnit.ownerId]);

    const handleViewDetails = () => {
        router.push(`/org/view/${orgUnit.id}`);
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
                    <User
                        avatar={{
                            text: `${owner?.firstName} ${owner?.lastName}`,
                            theme: 'brand',
                        }}
                        name={`${owner?.firstName} ${owner?.lastName}`}
                        description={owner?.email}
                        size="s"
                    />
                </Box>
                <Button view="normal" size="m" onClick={handleViewDetails}>
                    <Eye />
                </Button>
            </div>
        </Card>
    );
};
