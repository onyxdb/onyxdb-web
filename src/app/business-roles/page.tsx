'use client';

import React, {useState} from 'react';
import {Modal, Text} from '@gravity-ui/uikit';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Box} from '@/components/Layout/Box';
import {useAuth} from '@/context/AuthContext';
import {CirclePlus} from '@gravity-ui/icons';
import {useRouter} from 'next/navigation';
import {businessRolesApi} from '@/app/apis';
import BusinessRolesTable from '@/components/tables/BusinessRolesTable';
import BusinessRoleForm, {BusinessRoleFormFields} from '@/components/forms/BusinessRoleForm';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

export default function BusinessRolesPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);

    const handleEdit = (businessRoleId: string) => {
        if (checkPermission('business-role', 'edit', businessRoleId)) {
            router.push(`/business-roles/edit/${businessRoleId}`);
        } else {
            toaster.add({
                name: `permission_error_${businessRoleId}`,
                title: 'Нет разрешения на редактирование',
                content: `У вас нет разрешения на редактирование бизнес-роли с ID ${businessRoleId}`,
                theme: 'danger',
            });
        }
    };

    const handleDelete = async (businessRoleId: string, businessRoleName: string) => {
        if (checkPermission('business-role', 'delete', businessRoleId)) {
            try {
                await businessRolesApi.deleteBusinessRole({businessRoleId});
                toaster.add({
                    name: `business_role_delete_${businessRoleId}`,
                    title: `Бизнес-роль ${businessRoleName} успешно удалена`,
                    content: 'Операция успешно выполнена',
                    theme: 'success',
                });
            } catch (error) {
                toaster.add({
                    name: `error_business_role_delete_${businessRoleId}`,
                    title: `Ошибка удаления бизнес-роли ${businessRoleName}`,
                    content: `Не удалось удалить бизнес-роль ${error}`,
                    theme: 'danger',
                });
            }
        } else {
            toaster.add({
                name: `permission_error_${businessRoleId}`,
                title: 'Нет разрешения на удаление',
                content: `У вас нет разрешения на удаление бизнес-роли с ID ${businessRoleId}`,
                theme: 'danger',
            });
        }
    };

    const handleBusinessRoleCreate = async (values: BusinessRoleFormFields) => {
        try {
            const response = await businessRolesApi.createBusinessRole({
                businessRoleDTO: {
                    name: values.name,
                    shopName: values.shopName,
                    description: values.description,
                    parentId: values.parentBusinessRoleId,
                },
            });
            if (response.data.id) {
                handleEdit(response.data.id);
            }
        } catch (error) {
            toaster.add({
                name: 'error_business_role_create',
                title: 'Ошибка создания бизнес-роли',
                content: `Не удалось создать бизнес-роль ${error}`,
                theme: 'danger',
            });
        }
    };

    const handleCreateBusinessRoleModal = () => {
        setCreateModalVisible(true);
    };

    const handleCreateModalCancel = () => {
        setCreateModalVisible(false);
    };

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/business-roles', text: 'Бизнес-роли'},
    ];

    const actions = [];
    if (checkPermission('business-role', 'create')) {
        actions.push({
            text: 'Создать бизнес-роль',
            action: handleCreateBusinessRoleModal,
            icon: CirclePlus,
        });
    }

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Бизнес-роли</Text>
                </Box>
                <BusinessRolesTable editAction={handleEdit} deleteAction={handleDelete} />
            </div>
            <Modal open={isCreateModalVisible} onOpenChange={handleCreateModalCancel}>
                <BusinessRoleForm
                    submitAction={handleBusinessRoleCreate}
                    closeAction={handleCreateModalCancel}
                />
            </Modal>
        </div>
    );
}
