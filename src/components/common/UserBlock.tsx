'use client';

import React from 'react';
import {Card, User} from '@gravity-ui/uikit';
import {AccountDTO} from '@/generated/api';
import {useRouter} from 'next/navigation';

interface DomainComponentProps {
    account: AccountDTO;
    selectable?: boolean;
    size?: 's' | 'm' | 'l';
}

export const UserBlock: React.FC<DomainComponentProps> = ({account, selectable, size}) => {
    const router = useRouter();
    return (
        <Card
            view="clear"
            type={selectable ? 'selection' : 'container'}
            onClick={() => router.push(`/accounts/view/${account.id}`)}
        >
            <User
                avatar={{
                    text: `${account?.firstName} ${account?.lastName}`,
                    theme: 'brand',
                }}
                name={`${account?.firstName} ${account?.lastName}`}
                description={account?.email}
                size={size || 'm'}
            />
        </Card>
    );
};
