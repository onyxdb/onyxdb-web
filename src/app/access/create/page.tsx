'use client';

import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {rolesApi} from '@/app/apis';
import {RoleForm, RoleFormFields, mapPermissionFormToDTO} from '@/components/forms/RoleForm';

export default function CreateRolePage() {
    const router = useRouter();
    const pathname = usePathname();
    const breadCrumps = [
        {href: '/', text: 'Главная'},
        {href: '/roles', text: 'Роли'},
        {href: `${pathname}`, text: 'Создать роль'},
    ];

    const handleRoleCreate = async (values: RoleFormFields) => {
        try {
            const response = await rolesApi.createRole({
                roleWithPermissionsDTO: {
                    role: {
                        roleType: values.roleType,
                        name: values.name,
                        shopName: values.shopName,
                        isShopHidden: values.isShopHidden,
                        description: values.description,
                        productId: values.roleType === 'PRODUCT' ? values.productId : undefined,
                        orgUnitId: values.roleType === 'ORG_UNIT' ? values.orgUnitId : undefined,
                    },
                    permissions: values.permissions.map((p) => mapPermissionFormToDTO(p)),
                },
            });
            router.push(`/roles/edit/${response.data.role.id}`);
        } catch (error) {
            console.error('Failed to create role:', error);
        }
    };

    const handleCreateModalCancel = () => {
        router.push('/roles');
    };

    return (
        <div>
            <AppHeader breadCrumps={breadCrumps} actions={[]} />
            <RoleForm
                onSubmit={handleRoleCreate}
                onClose={handleCreateModalCancel}
                initialValue={undefined}
            />
        </div>
    );
}
