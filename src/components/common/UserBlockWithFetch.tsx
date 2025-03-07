'use client';

import React, {useEffect, useState} from 'react';
import {User} from '@gravity-ui/uikit';
import {AccountDTO} from '@/generated/api';
import {accountsApi} from '@/app/apis';

interface DomainComponentProps {
    accountId: string;
}

export const UserBlockWithFetch: React.FC<DomainComponentProps> = ({accountId}) => {
    const [owner, setOwner] = useState<AccountDTO | null>(null);

    useEffect(() => {
        if (accountId) {
            accountsApi
                .getAccountById({accountId: accountId})
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
    }, [accountId]);

    return (
        <User
            avatar={{
                text: `${owner?.firstName} ${owner?.lastName}`,
                theme: 'brand',
            }}
            name={`${owner?.firstName} ${owner?.lastName}`}
            description={owner?.email}
            size="s"
        />
    );
};
