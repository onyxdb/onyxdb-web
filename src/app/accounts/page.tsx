'use client';

import React, {useState} from 'react';
import {AccountDTO} from '@/generated/api';
import {Button, Modal} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import {accountsApi} from '@/app/apis';
import {AccountsTable} from '@/components/tables/AccountsTable';
import {AccountForm, AccountFormDTO} from '@/components/forms/AccountForm';

interface AccountsPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function AccountsPage({}: AccountsPageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountDTO | null>(null);
    const {checkPermission} = useAuth();

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingAccount(null);
    };

    const handleEdit = (accountId: string) => {
        accountsApi
            .getAccountById({accountId})
            .then((response) => {
                setEditingAccount(response.data ?? null);
                setIsCreateModalOpen(true);
            })
            .catch((error) => console.error('Error fetching account:', error));
    };

    const handleDelete = (accountId: string) => {
        accountsApi
            .deleteAccount({accountId})
            .then(() => {
                console.log('Account deleted successfully');
                // TODO: Сделать перезагрузку таблицы
            })
            .catch((error) => console.error('Error deleting account:', error));
    };

    const handleSubmitCreate = async (values: AccountFormDTO) => {
        try {
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            values.data = values.anyData;
            const {anyData: _, ...newValues} = values;
            if (editingAccount) {
                // Редактирование существующего аккаунта
                await accountsApi.updateAccount({
                    accountId: editingAccount.id ?? '???',
                    accountDTO: newValues,
                });
            } else {
                // Создание нового аккаунта
                await accountsApi.createAccount({accountDTO: newValues});
            }
            handleCloseCreateModal();
        } catch (error) {
            console.error('Ошибка при создании/редактировании аккаунта:', error);
        }
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
                {checkPermission('account', 'create') && (
                    <Button view="action" size="l" onClick={handleCreate}>
                        Создать аккаунт
                    </Button>
                )}
            </div>
            <AccountsTable editAction={handleEdit} deleteAction={handleDelete} />
            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <AccountForm
                    initialValue={editingAccount ?? undefined}
                    onSubmit={handleSubmitCreate}
                    onClose={handleCloseCreateModal}
                />
            </Modal>
        </div>
    );
}
