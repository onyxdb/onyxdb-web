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

export default function BusinessRolesPage() {
    const {checkPermission} = useAuth();
    const router = useRouter();

    const handleEdit = (businessRoleId: string) => {
        console.log('Edit business role with ID:', businessRoleId);
        router.push(`/business-roles/edit/${businessRoleId}`);
    };

    const handleDelete = async (businessRoleId: string) => {
        console.log('Delete business Role with ID:', businessRoleId);
        if (businessRoleId) {
            await businessRolesApi.deleteBusinessRole({businessRoleId: businessRoleId});
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
            console.error('Failed to create business role:', error);
        }
    };

    const [isCreateModalVisible, setCreateModalVisible] = useState(false);

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
