'use client';

import React, {useEffect, useState} from 'react';
import {AccountDTO} from '@/generated/api';
import {accountsApi} from '@/app/apis';
import {UserBlock} from '@/components/common/UserBlock';
import {Text} from '@gravity-ui/uikit';

interface DomainComponentProps {
    accountId: string;
    selectable?: boolean;
    size?: 's' | 'm' | 'l';
}

export const UserBlockWithFetch: React.FC<DomainComponentProps> = ({
    accountId,
    selectable,
    size,
}) => {
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

    if (!owner) {
        return <Text>???</Text>;
    }

    return <UserBlock account={owner} selectable={selectable} size={size} />;
};
