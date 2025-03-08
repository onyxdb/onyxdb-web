'use client';

import React, {useState} from 'react';
import {AccountDTO} from '@/generated/api';
import {Button, Modal} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';
import {accountsApi} from '@/app/apis';
import {AccountsTable} from '@/components/AccountsTable';
import {AccountForm} from '@/components/forms/AccountForm';

interface AccountsPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function AccountsPage({}: AccountsPageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountDTO | null>(null);
    const {permissions} = usePermissions();

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
                // Перезагрузка таблицы
                handleCreate(); // Просто чтобы закрыть модальное окно
            })
            .catch((error) => console.error('Error deleting account:', error));
    };

    const handleSubmitCreate = async (values: AccountDTO) => {
        try {
            if (editingAccount) {
                // Редактирование существующего аккаунта
                await accountsApi.updateAccount({
                    accountId: editingAccount.id ?? '???',
                    accountDTO: values,
                });
            } else {
                // Создание нового аккаунта
                await accountsApi.createAccount({accountDTO: values});
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
                {permissions['web-global-create'] && (
                    <Button view="action" size="l" onClick={handleCreate}>
                        Создать аккаунт
                    </Button>
                )}
            </div>
            <AccountsTable onEdit={handleEdit} onDelete={handleDelete} />
            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <h2>{editingAccount ? 'Редактирование аккаунта' : 'Создание нового аккаунта'}</h2>
                <AccountForm
                    initialValue={editingAccount ?? undefined}
                    onSubmit={handleSubmitCreate}
                    onClose={handleCloseCreateModal}
                />
                <Button view="normal" onClick={handleCloseCreateModal}>
                    Закрыть
                </Button>
            </Modal>
        </div>
    );
}
