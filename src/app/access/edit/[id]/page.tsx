'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {rolesApi} from '@/app/apis';
import {RoleDTO} from '@/generated/api';
import RoleForm, {RoleFormFields, mapPermissionFormToDTO} from '@/components/forms/RoleForm';
import {AsideComp} from '@/app/AsideComp';

export default function EditRolePage() {
    const router = useRouter();
    const pathname = usePathname();
    const roleId = pathname.split('/').pop() ?? '';
    const [role, setRole] = useState<RoleDTO | null>(null);
    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/access', text: 'Роли'},
        {href: `${pathname}`, text: 'Редактирование роли'},
    ];

    useEffect(() => {
        const fetchRole = async () => {
            try {
                const response = await rolesApi.getRoleById({roleId: roleId});
                setRole(response.data);
            } catch (error) {
                console.error('Error fetching role:', error);
            }
        };

        if (roleId) {
            fetchRole();
        }
    }, [roleId]);

    if (!role) {
        return <div>Загрузка...</div>;
    }

    const handleRoleEdit = async (values: RoleFormFields) => {
        try {
            await rolesApi.updateRole({
                roleId: roleId,
                roleWithPermissionsPostDTO: {
                    role: {
                        id: roleId,
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
            router.push('/access');
        } catch (error) {
            console.error('Failed to update role:', error);
        }
    };

    const handleEditModalCancel = () => {
        router.push('/access');
    };

    return (
        <AsideComp>
            <AppHeader breadCrumbs={breadCrumbs} actions={[]} />
            <RoleForm
                onSubmit={handleRoleEdit}
                closeAction={handleEditModalCancel}
                initialValue={role}
            />
        </AsideComp>
    );
}
