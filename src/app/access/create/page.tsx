'use client';

import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {rolesApi} from '@/app/apis';
import {RoleForm, RoleFormFields, mapPermissionFormToDTO} from '@/components/forms/RoleForm';
import {AsideComp} from '@/app/AsideComp';

export default function CreateRolePage() {
    const router = useRouter();
    const pathname = usePathname();
    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/access', text: 'Роли'},
        {href: `${pathname}`, text: 'Создать роль'},
    ];

    const handleRoleCreate = async (values: RoleFormFields) => {
        try {
            const response = await rolesApi.createRole({
                roleWithPermissionsPostDTO: {
                    role: {
                        roleType: values.roleType,
                        name: values.name,
                        shopName: values.shopName,
                        isShopHidden: values.isShopHidden,
                        description: values.description,
                        entity: values.entity,
                        productId: values.roleType === 'PRODUCT' ? values.productId : undefined,
                        orgUnitId: values.roleType === 'ORG_UNIT' ? values.orgUnitId : undefined,
                    },
                    permissions: values.permissions.map((p) => mapPermissionFormToDTO(p)),
                },
            });
            router.push(`/access/edit/${response.data.role.id}`);
        } catch (error) {
            console.error('Failed to create role:', error);
        }
    };

    const handleCreateModalCancel = () => {
        router.push('/access');
    };

    return (
        <AsideComp>
            <AppHeader breadCrumbs={breadCrumbs} actions={[]} />
            <RoleForm
                onSubmit={handleRoleCreate}
                closeAction={handleCreateModalCancel}
                initialValue={undefined}
            />
        </AsideComp>
    );
}
