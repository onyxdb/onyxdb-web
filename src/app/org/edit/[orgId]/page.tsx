'use client';

import React, {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import {usePermissions} from '@/hooks/usePermissions';
import {organizationUnitsApi} from '@/app/apis';
import {OrganizationUnitDTO} from '@/generated/api';

interface OrgCreatePageProps {}

// eslint-disable-next-line no-empty-pattern
export default function OrgCreatePage({}: OrgCreatePageProps) {
    const [orgUnit, setOrgUnit] = useState<OrganizationUnitDTO | undefined>(undefined);

    // const router = useRouter();
    const pathname = usePathname();
    const {checkPermission} = usePermissions();
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

    // const handleClose = () => {
    //     if (window.history?.length && window.history.length > 1) {
    //         router.back();
    //     } else {
    //         router.push('/structure');
    //     }
    // };

    // const handleSubmitCreate = async (values: OrgUnitFormFields) => {
    //     try {
    //         await organizationUnitsApi.createOrganizationUnit({
    //             organizationUnitDTO: {
    //                 name: values.name,
    //                 description: values.description,
    //                 domainComponentId: values.domainComponentId,
    //                 parentId: values.parentOrgUnitId ?? null,
    //                 ownerId: values.ownerAccountId ?? null,
    //             },
    //         });
    //         handleClose();
    //         router.push(`/structure/${values.domainComponentId}`);
    //     } catch (error) {
    //         console.error('Ошибка при создании OU:', error);
    //     }
    // };

    if (!checkPermission('web-global-domain-components-create')) {
        return (
            <div style={{padding: '20px'}}>У вас нет разрешения на создание Organization Unit.</div>
        );
    }

    console.log(orgUnit);
    return <div style={{padding: '20px'}}>TODO</div>;
}
