'use client';

import React, {useEffect, useState} from 'react';
import {domainComponentsApi, organizationUnitsApi} from '@/app/apis';
import {DomainComponentDTO, OrganizationUnitDTO} from '@/generated/api';
import {usePathname, useRouter} from 'next/navigation';
import Link from 'next/link';
import {
    Breadcrumbs,
    BreadcrumbsItem,
    Button,
    Card,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';

// @ts-ignore
function RouterLink({href, ...rest}) {
    return (
        <Link href={href} passHref legacyBehavior>
            <BreadcrumbsItem {...rest} />;
        </Link>
    );
}

interface BreadItems {
    id: string;
    name: string;
    href: string;
}

interface OrgViewPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function OrgViewPage({}: OrgViewPageProps) {
    const [orgUnit, setOrgUnit] = useState<OrganizationUnitDTO | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadItems[]>([]);
    const [domainComponent, setDomainComponent] = useState<DomainComponentDTO | null>(null);
    const [activeTab, setActiveTab] = useState<string>('info');
    const router = useRouter();
    const pathname = usePathname();
    const {permissions} = usePermissions();

    const orgId = pathname.split('/').pop() ?? '';

    // const breadItems = [
    //     {id: 1, name: 'Domain Component', href: '/dc'},
    //     {id: 2, name: 'Country', href: `/org/view/${}`},
    //     {id: 3, name: 'City', href: ''},
    // ];

    useEffect(() => {
        const fetchOrgUnit = async () => {
            try {
                const orgUnitsResponse = await organizationUnitsApi.getOrganizationUnitParents({
                    ouId: orgId,
                });

                const currentOrgUnit = orgUnitsResponse.data.find(
                    (orgUnitItem) => orgUnitItem.id === orgId,
                );
                if (!currentOrgUnit) {
                    throw Error(`Error fetching organization unit: ${currentOrgUnit}`);
                }
                setOrgUnit(currentOrgUnit);

                const dcResponse = await domainComponentsApi.getDomainComponentById({
                    dcId: currentOrgUnit.domainComponentId,
                });
                setDomainComponent(dcResponse.data ?? null);

                const items: BreadItems[] = [];
                if (domainComponent) {
                    items.push({
                        id: domainComponent.id ?? '???',
                        name: domainComponent.name,
                        href: currentOrgUnit.domainComponentId,
                    });
                }
                setBreadcrumbs(items);
            } catch (error) {
                console.error('Error fetching organization unit:', error);
            }
        };

        fetchOrgUnit();
    }, [orgId]);

    return (
        <div style={{padding: '20px'}}>
            <div style={{marginBottom: '20px'}}>
                <Breadcrumbs itemComponent={RouterLink}>
                    {breadcrumbs.map((i) => (
                        <RouterLink key={i.id} href={i.href}>
                            {i.name}
                        </RouterLink>
                    ))}
                </Breadcrumbs>
            </div>
            <div style={{display: 'flex'}}>
                <div style={{width: '200px', marginRight: '20px'}}>
                    <TabProvider value={activeTab} onUpdate={setActiveTab}>
                        <TabList>
                            <Tab value="info">Информация</Tab>
                            <Tab value="team">Команда</Tab>
                            <Tab value="children">Дочерние Структуры</Tab>
                        </TabList>
                        <div>
                            <TabPanel value="info">First Panel</TabPanel>
                            <TabPanel value="team">Second Panel</TabPanel>
                            <TabPanel value="children">Third Panel</TabPanel>
                        </div>
                    </TabProvider>
                </div>
                <div style={{flex: 1}}>
                    <Card>
                        <TabPanel value="info">
                            <div style={{padding: '16px'}}>
                                <h2>Информация</h2>
                                <div>Название: {orgUnit?.name}</div>
                                <div>Владелец: {orgUnit?.ownerId}</div>
                                <div>Описание: {orgUnit?.description}</div>
                            </div>
                        </TabPanel>
                        <TabPanel value="team">
                            <div style={{padding: '16px'}}>
                                <h2>Команда</h2>
                                {/* Здесь можно добавить список пользователей */}
                            </div>
                        </TabPanel>
                        <TabPanel value="children">
                            <div style={{padding: '16px'}}>
                                <h2>Дочерние структуры</h2>
                                {/* Здесь можно добавить список дочерних OU */}
                            </div>
                        </TabPanel>

                        {permissions[`web-org-${orgId}-edit`] && (
                            <div style={{marginTop: '20px'}}>
                                <Button
                                    view="action"
                                    size="l"
                                    onClick={() => router.push(`/org/edit/${orgId}`)}
                                >
                                    Редактировать OU
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
