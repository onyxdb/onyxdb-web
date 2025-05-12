'use client';

import React from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';
import {organizationUnitsApi} from '@/app/apis';
import {OrgCreateForm, OrgUnitFormFields} from '@/components/forms/OrgCreateForm';
import {AsideComp} from '@/app/AsideComp';

interface OrgCreatePageProps {}

// eslint-disable-next-line no-empty-pattern
export default function OrgCreatePage({}: OrgCreatePageProps) {
    const router = useRouter();
    const {checkPermission} = useAuth();

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
                organizationUnitPostDTO: {
                    name: values.name,
                    description: values.description,
                    domainComponentId: values.domainComponentId,
                    parentId: values.parentOrgUnitId ?? null,
                    ownerId: values.ownerAccountId ?? null,
                },
            });
            handleClose();
            router.push(`/structure?dcId=${values.domainComponentId}`);
        } catch (error) {
            console.error('Ошибка при создании OU:', error);
        }
    };

    if (!checkPermission('organization-unit', 'create')) {
        return (
            <div style={{padding: '20px'}}>У вас нет разрешения на создание Organization Unit.</div>
        );
    }

    return (
        <AsideComp>
            <OrgCreateForm onSubmit={handleSubmitCreate} closeAction={handleClose} />
        </AsideComp>
    );
}
