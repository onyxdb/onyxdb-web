'use client';

import React from 'react';
import {Button, Card, Icon, Text} from '@gravity-ui/uikit';
import {AccountDTO, OrganizationUnitDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {UserBlock} from '@/components/common/UserBlock';
import {useRouter} from 'next/navigation';
import {Box} from '@/components/Layout/Box';
import {Pencil, TrashBin} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';

interface DomainComponentProps {
    data: OrganizationUnitDTO;
    dataAccounts: AccountDTO[];
    editAction: (ou: OrganizationUnitDTO) => void;
    deleteAction: (id: string) => void;
}

export const OrgUnitBlock: React.FC<DomainComponentProps> = ({data, dataAccounts, editAction, deleteAction}) => {
    const router = useRouter();
    const {checkPermission} = useAuth();
    const handleViewDetails = (ouId: string) => {
        router.push(`/structure/view/${ouId}`);
    };

    return (
        <Card style={{padding: '16px'}}>
            <div style={{marginBottom: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <Text variant="header-1">{data.name}</Text>
                        <Box>
                            <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                {data.description}
                            </Text>
                        </Box>
                    </div>
                    <Box marginLeft="10px">
                        {checkPermission('organization-unit', 'create') && (
                            <Box marginBottom="5px">
                                <Button view="normal" size="m" onClick={() => editAction(data)}>
                                    <Icon data={Pencil} />
                                </Button>
                            </Box>
                        )}
                        {checkPermission('organization-unit', 'delete') && (
                            <Button view="outlined-danger" size="m" onClick={() => deleteAction(data.id)}>
                                <Icon data={TrashBin} />
                            </Button>
                        )}
                    </Box>
                </div>
                <div style={{marginBottom: '8px'}}>
                    <strong>Владелец:</strong>
                    {data.ownerId ? <UserBlockWithFetch accountId={data.ownerId} selectable={true} size="l" /> : 'Not stated'}
                </div>
                <div style={{marginBottom: '8px'}}>
                    <strong>Сотрудники:</strong>
                    {dataAccounts.map((account) => (
                        <div key={account.id} style={{marginBottom: '4px'}}>
                            <UserBlock account={account} selectable={true} size="l" />
                        </div>
                    ))}
                </div>
                <Button view="normal" size="l" onClick={() => handleViewDetails(data?.id)}>
                    Подробнее
                </Button>
            </div>
        </Card>
    );
};
