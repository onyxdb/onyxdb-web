'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {usePermissions} from '@/hooks/usePermissions';
import {organizationUnitsApi} from '@/app/apis';
import {OrgCreateForm, OrgUnitFormFields} from '@/components/forms/OrgCreateForm';

interface OrgCreatePageProps {}

// eslint-disable-next-line no-empty-pattern
export default function OrgCreatePage({}: OrgCreatePageProps) {
    const router = useRouter();
    const {checkPermission} = usePermissions();

    const handleClose = () => {
        if (window.history?.length && window.history.length > 1) {
            router.back();
        } else {
            router.push('/structure');
        }
    };

    const handleSubmitCreate = async (values: OrgUnitFormFields) => {
        try {
            await organizationUnitsApi.createOrganizationUnit({
                organizationUnitDTO: {
                    name: values.name,
                    description: values.description,
                    domainComponentId: values.domainComponentId,
                    parentId: values.parentOrgUnitId ?? null,
                    ownerId: values.ownerAccountId ?? null,
                },
            });
            handleClose();
            router.push(`/structure/${values.domainComponentId}`);
        } catch (error) {
            console.error('Ошибка при создании OU:', error);
        }
    };

    if (!checkPermission('web-global-domain-components-create')) {
        return (
            <div style={{padding: '20px'}}>У вас нет разрешения на создание Organization Unit.</div>
        );
    }

    return (
        <div style={{padding: '20px'}}>
            <OrgCreateForm onSubmit={handleSubmitCreate} onClose={handleClose} />
        </div>
    );
}
