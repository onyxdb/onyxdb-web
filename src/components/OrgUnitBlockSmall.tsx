'use client';

import React, {useEffect, useState} from 'react';
import {Card, Label} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {AccountDTO, OrganizationUnitDTO} from '@/generated/api';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {accountsApi} from '@/app/apis';
import {UserBlock} from '@/components/common/UserBlock';

interface DomainComponentProps {
    data: OrganizationUnitDTO;
}

export const OrgUnitBlockSmall: React.FC<DomainComponentProps> = ({data}) => {
    const router = useRouter();

    const [owner, setOwner] = useState<AccountDTO | null>(null);

    useEffect(() => {
        if (data.ownerId) {
            accountsApi
                .getAccountById({accountId: data.ownerId})
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
    }, [data.ownerId]);

    const handleViewDetails = (ouId: string) => {
        router.push(`/structure/view/${ouId}`);
    };

    return (
        <div
            key={data.id}
            style={{marginBottom: '8px', cursor: 'pointer'}}
            onClick={() => handleViewDetails(data.id ?? '???')}
        >
            <Card theme="info">
                <HorizontalStack align="center">
                    <Box marginLeft="5px">
                        <HorizontalStack align="center">
                            <Label theme="utility">{data.name}</Label>
                            {owner && <UserBlock account={owner} selectable={true} size="s" />}
                        </HorizontalStack>
                    </Box>
                </HorizontalStack>
            </Card>
        </div>
    );
};
