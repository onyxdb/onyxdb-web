'use client';

import React from 'react';
import RoleTable from '@/components/tables/RoleTable';
import {rolesApi} from '@/app/apis';
import {useRouter} from 'next/navigation';

export default function RolesPage() {
    const router = useRouter();

    const handleEdit = (roleId: string) => {
        console.log('Edit role with ID:', roleId);
        router.push(`/access/edit/${roleId}`);
    };

    const handleDelete = async (roleId: string) => {
        console.log('Delete role with ID:', roleId);
        if (roleId) {
            await rolesApi.deleteRole({roleId: roleId});
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Роли</h1>
            <RoleTable onEdit={handleEdit} onDelete={handleDelete} />
        </div>
    );
}
