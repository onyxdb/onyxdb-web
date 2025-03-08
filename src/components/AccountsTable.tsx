'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO} from '@/generated/api';
import {Button, Table, TableColumnConfig, TextInput, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';

interface AccountsTableProps {
    onEdit: (accountId: string) => void;
    onDelete: (accountId: string) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({onEdit, onDelete}) => {
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit] = useState<number>(8);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const router = useRouter();

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await accountsApi.getAllAccounts({
                    search: searchQuery,
                    limit,
                    offset,
                });
                setAccounts(response.data.data ?? []);
                setTotal(response.data.totalCount ?? 0);
            } catch (error) {
                console.error('Error fetching accounts:', error);
            }
        };

        fetchAccounts();
    }, [searchQuery, limit, offset]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setOffset(0);
    };

    const handleNextPage = () => {
        setOffset(offset + limit);
    };

    const handlePrevPage = () => {
        setOffset(Math.max(0, offset - limit));
    };

    const columns: TableColumnConfig<AccountDTO>[] = [
        {
            id: 'username',
            name: 'Логин',
            template: (account) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/accounts/${account.id}/view`)}
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
        {
            id: 'actions',
            name: 'Действия',
            template: (account) => (
                <div style={{display: 'flex', gap: '10px'}}>
                    <Button view="normal" size="m" onClick={() => onEdit(account.id ?? '???')}>
                        Редактировать
                    </Button>
                    <Button view="normal" size="m" onClick={() => onDelete(account.id ?? '???')}>
                        Удалить
                    </Button>
                </div>
            ),
        },
    ];

    const MyTable = withTableSorting(Table);

    return (
        <div>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по имени пользователя"
                    value={searchQuery}
                    onUpdate={handleSearch}
                />
            </div>
            <MyTable
                data={accounts}
                columns={columns}
                // onSort={(column: string, order: 'asc' | 'desc') => handleSort(column, order)}
                // sortState={sorting}
            />
            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'space-between'}}>
                <Button view="normal" size="m" onClick={handlePrevPage} disabled={offset === 0}>
                    Предыдущая страница
                </Button>
                <Button
                    view="normal"
                    size="m"
                    onClick={handleNextPage}
                    disabled={offset + limit >= total}
                >
                    Следующая страница
                </Button>
            </div>
        </div>
    );
};
