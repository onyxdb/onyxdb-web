'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO} from '@/generated/api';
import {
    Button,
    Icon,
    Pagination,
    Table,
    TableColumnConfig,
    TextInput,
    useToaster,
    withTableSorting,
} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';
import {TextWithCopy} from '@/components/common/TextWithCopy';
import {Pencil, TrashBin} from '@gravity-ui/icons';

interface AccountsTableProps {
    editAction?: (accountId: string) => void;
    deleteAction?: (accountId: string, accountName: string) => Promise<boolean>;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({editAction, deleteAction}) => {
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const router = useRouter();
    const {checkPermission, user} = useAuth();
    const toaster = useToaster();

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
            toaster.add({
                name: 'error_account_get',
                title: 'Ошибка поиска аккаунта',
                content: `Не удалось найти аккаунты ${error}`,
                theme: 'danger',
            });
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [searchQuery, limit, offset]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setOffset(0);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setLimit(pageSize);
        setOffset((page - 1) * pageSize);
    };

    const handleDelete = async (accountId: string, accountName: string) => {
        if (!deleteAction) {
            return;
        }
        const isSuccess = await deleteAction(accountId, accountName);
        if (isSuccess) {
            await fetchAccounts();
        }
    };

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

    if (editAction || deleteAction) {
        columns.push({
            id: 'actions',
            name: 'Действия',
            template: (account) => (
                <div style={{display: 'flex', gap: '10px'}}>
                    {editAction &&
                    (checkPermission('account', 'edit') || user?.account.id === account.id) ? (
                        <Button view="normal" size="m" onClick={() => editAction(account.id)}>
                            <Icon data={Pencil} />
                            Редактировать
                        </Button>
                    ) : null}
                    {deleteAction && checkPermission('account', 'delete') ? (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() =>
                                handleDelete(
                                    account?.id,
                                    `${account.firstName} ${account.lastName}`,
                                )
                            }
                        >
                            <Icon data={TrashBin} />
                            Удалить
                        </Button>
                    ) : null}
                </div>
            ),
        });
    }

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
                width="max"
                data={accounts}
                // @ts-ignore
                columns={columns}
            />
            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                <Pagination
                    page={offset / limit + 1}
                    pageSize={limit}
                    pageSizeOptions={[5, 10, 20, 100]}
                    total={total}
                    onUpdate={handlePageChange}
                />
            </div>
        </div>
    );
};
