'use client';

import React from 'react';
import {User} from '@gravity-ui/uikit';
import {AccountDTO} from '@/generated/api';

interface DomainComponentProps {
    account: AccountDTO;
}

export const UserBlock: React.FC<DomainComponentProps> = ({account}) => {
    return (
        <User
            avatar={{
                text: `${account?.firstName} ${account?.lastName}`,
                theme: 'brand',
            }}
            name={`${account?.firstName} ${account?.lastName}`}
            description={account?.email}
            size="s"
        />
    );
};
