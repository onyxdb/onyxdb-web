'use client';

import React from 'react';
import {Button, Card, Icon} from '@gravity-ui/uikit';
import {AccountDTO, OrganizationUnitDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {UserBlock} from '@/components/common/UserBlock';
import {useRouter} from 'next/navigation';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {Pencil, TrashBin} from '@gravity-ui/icons';
import {usePermissions} from '@/hooks/usePermissions';

interface DomainComponentProps {
    data: OrganizationUnitDTO;
    dataAccounts: AccountDTO[];
    onEdit: (ou: OrganizationUnitDTO) => void;
    onDelete: (id: string) => void;
}

export const OrgUnitBlock: React.FC<DomainComponentProps> = ({
    data,
    dataAccounts,
    onEdit,
    onDelete,
}) => {
    const router = useRouter();
    const {checkPermission} = usePermissions();
    const handleViewDetails = (ouId: string) => {
        router.push(`/org/view/${ouId}`);
    };

    return (
        <Card style={{padding: '16px'}}>
            <div style={{marginBottom: '12px'}}>
                <HorizontalStack justify="space-between">
                    <h2>{data.name}</h2>
                    <div>
                        {checkPermission('web-global-organization-unit', 'create') && (
                            <Box marginBottom="5px">
                                <Button view="normal" size="m" onClick={() => onEdit(data)}>
                                    <Icon data={Pencil} />
                                </Button>
                            </Box>
                        )}
                        {checkPermission('web-global-organization-unit', 'delete') && (
                            <Button
                                view="outlined-danger"
                                size="m"
                                onClick={() => onDelete(data.id ?? '???')}
                            >
                                <Icon data={TrashBin} />
                            </Button>
                        )}
                    </div>
                </HorizontalStack>
                <div style={{marginBottom: '8px'}}>
                    <strong>Описание:</strong> {data.description}
                </div>
                <div style={{marginBottom: '8px'}}>
                    <strong>Владелец:</strong>
                    {data.ownerId ? (
                        <UserBlockWithFetch accountId={data.ownerId} selectable={true} size="l" />
                    ) : (
                        'Not stated'
                    )}
                </div>
                <div style={{marginBottom: '8px'}}>
                    <strong>Сотрудники:</strong>
                    {dataAccounts.map((account) => (
                        <div key={account.id} style={{marginBottom: '4px'}}>
                            <UserBlock account={account} selectable={true} size="l" />
                        </div>
                    ))}
                </div>
                <Button view="normal" size="l" onClick={() => handleViewDetails(data?.id ?? '???')}>
                    Подробнее
                </Button>
            </div>
        </Card>
    );
};
