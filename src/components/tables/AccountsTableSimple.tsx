'use client';

import React from 'react';
import {AccountDTO} from '@/generated/api';
import {Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {TextWithCopy} from '@/components/common/TextWithCopy';

interface AccountsTableSimpleProps {
    accounts: AccountDTO[];
}

export const AccountsTableSimple: React.FC<AccountsTableSimpleProps> = ({accounts}) => {
    const router = useRouter();

    const columns: TableColumnConfig<AccountDTO>[] = [
        {
            id: 'id',
            name: 'Id',
            template: (item) => <TextWithCopy text={item.id} maxLength={8} />,
        },
        {
            id: 'username',
            name: 'Логин',
            template: (account) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/accounts/view/${account.id}`)}
                >
                    {account.username}
                </span>
            ),
            meta: {
                sort: true,
            },
        },
        {
            id: 'fio',
            name: 'ФИО',
            template: (account) => `${account.firstName} ${account.lastName}`,
            meta: {
                sort: true,
            },
        },
        {
            id: 'email',
            name: 'Email',
            template: (account) => account.email,
            meta: {
                sort: true,
            },
        },
    ];

    const MyTable = withTableSorting(Table);
    return (
        <div>
            <MyTable
                width="max"
                data={accounts}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};
