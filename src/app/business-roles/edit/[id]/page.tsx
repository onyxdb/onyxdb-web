'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {businessRolesApi} from '@/app/apis';
import {BusinessRoleDTO} from '@/generated/api';
import {
    BusinessRoleEditForm,
    BusinessRoleEditFormFields,
} from '@/components/forms/BusinessRoleEditForm';
import {AppHeader} from '@/components/AppHeader/AppHeader';

export default function BusinessRoleEditPage() {
    const router = useRouter();
    const pathname = usePathname();
    const brId = pathname.split('/').pop() ?? '';
    const [businessRole, setBusinessRole] = useState<BusinessRoleDTO | null>(null);

    const fetchBusinessRole = async () => {
        try {
            const response = await businessRolesApi.getBusinessRoleById({businessRoleId: brId});
            setBusinessRole(response.data);
        } catch (error) {
            console.error('Error fetching business role:', error);
        }
    };
    useEffect(() => {
        if (brId) {
            fetchBusinessRole();
        }
    }, [brId]);

    const handleModalCancel = () => {
        router.push('/business-roles');
    };

    const handleBusinessRoleEdit = async (values: BusinessRoleEditFormFields) => {
        try {
            await businessRolesApi.updateBusinessRole({
                businessRoleId: brId,
                businessRoleDTO: {
                    id: brId,
                    name: values.name,
                    shopName: values.shopName,
                    description: values.description,
                    parentId:
                        brId === values.parentBusinessRoleId
                            ? undefined
                            : values.parentBusinessRoleId,
                },
            });
            fetchBusinessRole();
            handleModalCancel();
        } catch (error) {
            console.error('Failed to update business role:', error);
        }
    };

    if (!businessRole) {
        return <div>Загрузка...</div>;
    }

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/business-roles', text: 'Бизнес-роли'},
        {href: `/business-roles/edit/${brId}`, text: 'Редактирование бизнес-роли'},
    ];

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={[]} />
            <BusinessRoleEditForm
                onSubmit={handleBusinessRoleEdit}
                onClose={handleModalCancel}
                initialValue={businessRole}
            />
        </div>
    );
}
