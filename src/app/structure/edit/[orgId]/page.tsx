'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {useAuth} from '@/context/AuthContext';
import {organizationUnitsApi} from '@/app/apis';
import {OrganizationUnitDTO} from '@/generated/api';
import {AsideComp} from '@/app/AsideComp';
import {OrgEditForm, OrgUnitFormFields} from '@/components/forms/OrgEditForm';

interface OrgCreatePageProps {}

// eslint-disable-next-line no-empty-pattern
export default function OrgEditPage({}: OrgCreatePageProps) {
    const [orgUnit, setOrgUnit] = useState<OrganizationUnitDTO | undefined>(undefined);

    const router = useRouter();
    const pathname = usePathname();
    const {checkPermission} = useAuth();
    const orgId = pathname.split('/').pop() ?? '';

    useEffect(() => {
        const fetchOrgUnit = async () => {
            try {
                const orgUnitResponse = await organizationUnitsApi.getOrganizationUnitById({
                    ouId: orgId,
                });
                setOrgUnit(orgUnitResponse.data ?? null);
            } catch (error) {
                console.error('Error fetching organization unit:', error);
            }
        };

        fetchOrgUnit();
    }, [orgId]);

    const handleClose = () => {
        if (window.history?.length && window.history.length > 1) {
            router.back();
        } else {
            router.push('/structure');
        }
    };

    const handleSubmitEdit = async (values: OrgUnitFormFields) => {
        try {
            if (!orgUnit) {
                return
            }
            await organizationUnitsApi.updateOrganizationUnit({
                ouId: orgId,
                organizationUnitPostDTO: {
                    name: values.name,
                    description: values.description,
                    domainComponentId: orgUnit.domainComponentId,
                    parentId: orgUnit.parentId,
                    ownerId: orgUnit.ownerId,
                },
            });
            handleClose();
            router.push(`/structure?dcId=${orgUnit.domainComponentId}`);
        } catch (error) {
            console.error('Ошибка при создании OU:', error);
        }
    };

    if (!checkPermission('organization-unit', 'edit') || !orgUnit) {
        return <div style={{padding: '20px'}}>У вас нет разрешения на редактирование Organization Unit.</div>;
    }

    console.info(orgUnit);
    return (
        <AsideComp>
            <OrgEditForm onSubmit={handleSubmitEdit} closeAction={handleClose} initialValues={orgUnit} />
        </AsideComp>
    );
}
