'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO} from '@/generated/api';
import {Button, Table, TableColumnConfig, TextInput, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';

export default function About() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        accountsApi
            .getAllAccounts()
            .then((response) => setAccounts(response.data.data ?? []))
            .catch((error) => console.error('Error fetching accounts:', error));
    }, []);

    const MyTable = withTableSorting(Table);

    const columns: TableColumnConfig<AccountDTO>[] = [
        {
            id: 'username',
            name: 'Логин',
            template: (account) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/accounts/${account.id}/info`)}
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
            id: 'createdAt',
            name: 'Дата создания',
            meta: {
                sort: true,
            },
        },
    ];

    const handleCreateAccount = () => {
        router.push('/accounts/create');
    };

    return (
        <div style={{padding: '20px'}}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h1>Аккаунты</h1>
                <Button view="action" size="l" onClick={handleCreateAccount}>
                    Создать аккаунт
                </Button>
            </div>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по названию"
                    value={searchQuery}
                    onUpdate={(value) => setSearchQuery(value)}
                />
            </div>
            <MyTable
                data={accounts}
                columns={columns}
                // onSort={(column: string, order: 'asc' | 'desc') => handleSort(column, order)}
                // sortState={sorting}
            />
        </div>
    );
}
