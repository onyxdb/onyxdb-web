'use client';

import React from 'react';
import {Button, Card} from '@gravity-ui/uikit';
import {AccountDTO, OrganizationUnitDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {UserBlock} from '@/components/common/UserBlock';
import {useRouter} from 'next/navigation';

interface DomainComponentProps {
    data: OrganizationUnitDTO;
    dataAccounts: AccountDTO[];
}

export const OrgUnitBlock: React.FC<DomainComponentProps> = ({data, dataAccounts}) => {
    const router = useRouter();
    const handleViewDetails = (ouId: string) => {
        router.push(`/org/view/${ouId}`);
    };

    return (
        <Card style={{padding: '16px'}}>
            <div style={{marginBottom: '12px'}}>
                <h2>{data.name}</h2>
                <div style={{marginBottom: '8px'}}>
                    <strong>Описание:</strong> {data.description}
                </div>
                <div style={{marginBottom: '8px'}}>
                    <strong>Владелец:</strong>
                    {data.ownerId ? <UserBlockWithFetch accountId={data.ownerId} /> : 'Not stated'}
                </div>
                <div style={{marginBottom: '8px'}}>
                    <strong>Сотрудники:</strong>
                    {dataAccounts.map((account) => (
                        <div key={account.id} style={{marginBottom: '4px'}}>
                            <UserBlock account={account} />
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
