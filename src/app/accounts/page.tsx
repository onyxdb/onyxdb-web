'use client';

import React, {useState} from 'react';
import {AccountDTO} from '@/generated/api';
import {Modal, Text} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import {accountsApi} from '@/app/apis';
import {AccountsTable} from '@/components/tables/AccountsTable';
import {AccountForm, AccountFormDTO} from '@/components/forms/AccountForm';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {CirclePlus} from '@gravity-ui/icons';
import {Box} from '@/components/Layout/Box';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

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
        return accountsApi
            .getAccountById({accountId})
            .then((response) => {
                setEditingAccount(response.data ?? null);
                setIsCreateModalOpen(true);
                return true;
            })
            .catch((error) => {
                toaster.add({
                    name: 'error_account_edit',
                    title: 'Ошибка редактирования аккаунта',
                    content: `Не удалось изменить аккаунт ${error}.`,
                    theme: 'danger',
                });
                return false;
            });
    };

    const handleDelete = (accountId: string, accountName: string) => {
        return accountsApi
            .deleteAccount({accountId})
            .then(() => {
                toaster.add({
                    name: `account_delete_${accountId}`,
                    title: `Аккаунт ${accountName} успешно удалён`,
                    content: `Операция успешно выполнена`,
                    theme: 'success',
                });
                return true;
            })
            .catch((error) => {
                toaster.add({
                    name: `error_account_delete_${accountId}`,
                    title: `Ошибка удаления аккаунта ${accountName}`,
                    content: `Не удалось удалить аккаунт ${error}.`,
                    theme: 'danger',
                });
                return false;
            });
    };

    const handleSubmitCreate = async (values: AccountFormDTO) => {
        try {
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            values.data = values.anyData;
            const {anyData: _, ...newValues} = values;
            if (editingAccount) {
                await accountsApi.updateAccount({
                    accountId: editingAccount.id ?? '???',
                    accountDTO: newValues,
                });
                toaster.add({
                    name: `account_edit_${editingAccount.id}`,
                    title: `Аккаунт ${values.firstName} ${values.lastName} успешно изменён`,
                    content: 'Операция выполнена успешно.',
                    theme: 'success',
                });
            } else {
                await accountsApi.createAccount({accountDTO: newValues});
                toaster.add({
                    name: 'account_created',
                    title: 'Аккаунт успешно создан',
                    content: 'Операция выполнена успешно.',
                    theme: 'success',
                });
            }
            handleCloseCreateModal();
        } catch (error) {
            if (editingAccount) {
                toaster.add({
                    name: `account_edit_${editingAccount.id}`,
                    title: 'Ошибка изменения аккаунта',
                    content: `Не удалось изменить аккаунт ${error}.`,
                    theme: 'danger',
                });
            } else {
                toaster.add({
                    name: 'error_account_create',
                    title: 'Ошибка создания аккаунта',
                    content: `Не удалось создать аккаунт ${error}.`,
                    theme: 'danger',
                });
            }
        }
    };

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/accounts', text: 'Аккаунты'},
    ];

    const actions = [];
    if (checkPermission('account', 'create')) {
        actions.push({
            text: 'Создать аккаунт',
            action: handleCreate,
            icon: CirclePlus,
        });
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-1">Каталог аккаунтов</Text>
                </Box>
                <AccountsTable editAction={handleEdit} deleteAction={handleDelete} />
            </div>
            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <AccountForm
                    initialValue={editingAccount ?? undefined}
                    onSubmit={handleSubmitCreate}
                    closeAction={handleCloseCreateModal}
                />
            </Modal>
        </div>
    );
}
