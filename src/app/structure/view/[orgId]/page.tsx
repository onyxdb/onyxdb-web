'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Icon, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {organizationUnitsApi} from '@/app/apis';
import {AccountDTO, OrganizationTreeDTO, OrganizationUnitDTO} from '@/generated/api';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Clock, ClockArrowRotateLeft, Persons, Star} from '@gravity-ui/icons';
import {AccountsTableSimple} from '@/components/tables/AccountsTableSimple';
import {OrganizationUnitSmallCard} from '@/components/OrganizationUnitSmallCard';
import {AsideComp} from '@/app/AsideComp';

export default function OrgUnitDetailPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'info';
    const orgUnitId = pathname.split('/').pop() ?? '';

    const [orgUnit, setOrgUnit] = useState<OrganizationUnitDTO | null>(null);
    const [orgUnitParents, setOrgUnitParents] = useState<OrganizationUnitDTO[]>([]);
    const [orgUnitAccounts, setOrgUnitAccounts] = useState<AccountDTO[]>([]);
    const [orgUnitTree, setOrgUnitTree] = useState<OrganizationTreeDTO | null>(null);

    const fetchOrganizationUnitParents = async () => {
        try {
            const response = await organizationUnitsApi.getOrganizationUnitParents({
                ouId: orgUnitId,
            });
            const reversedData = response.data.reverse();
            setOrgUnitParents(reversedData);
        } catch (error) {
            console.error('Error fetching orgUnit parents:', error);
        }
    };

    const fetchOrganizationUnit = async () => {
        try {
            const response = await organizationUnitsApi.getOrganizationUnitById({ouId: orgUnitId});
            setOrgUnit(response.data);
        } catch (error) {
            console.error('Error fetching orgUnit:', error);
        }
    };

    const fetchOrganizationUnitAccounts = async () => {
        try {
            const response = await organizationUnitsApi.getAccountsByouId({ouId: orgUnitId});
            setOrgUnitAccounts(response.data);
        } catch (error) {
            console.error('Error fetching orgUnit accounts:', error);
        }
    };

    const fetchOrganizationUnitTree = async () => {
        try {
            const response = await organizationUnitsApi.getOrganizationUnitTree({ouId: orgUnitId});
            setOrgUnitTree(response.data);
        } catch (error) {
            console.error('Error fetching orgUnit tree:', error);
        }
    };

    useEffect(() => {
        fetchOrganizationUnit();
        fetchOrganizationUnitParents();
        fetchOrganizationUnitAccounts();
        fetchOrganizationUnitTree();
    }, [orgUnitId]);

    const handleTabChange = (value: string) => {
        const createQueryString = (name: string, val: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, val);
            return params.toString();
        };
        router.push(pathname + '?' + createQueryString('tab', value));
    };

    if (!orgUnit) {
        return <div>Продукт не найден</div>;
    }

    const renderOrgUnitTree = (tree: OrganizationTreeDTO | null) => {
        if (!tree) {return null;}

        const renderItem = (item: OrganizationTreeDTO, level = 0) => {
            return (
                <div key={item.unit.id} style={{marginLeft: `${level * 30}px`}}>
                    <OrganizationUnitSmallCard orgUnit={item.unit} />
                    {item.items && item.items.length > 0 && (
                        <div>{item.items.map((child) => renderItem(child, level + 1))}</div>
                    )}
                </div>
            );
        };

        return (
            <div>
                {tree.items && tree.items.length > 0 && (
                    <div>{tree.items.map((child) => renderItem(child))}</div>
                )}
            </div>
        );
    };

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/structure', text: 'Структура'},
        ...orgUnitParents.map((parent) => ({
            href: `/structure/view/${parent.id}`,
            text: parent.name,
        })),
    ];

    return (
        <AsideComp>
            <AppHeader breadCrumbs={breadCrumbs} actions={[]} />
            <div style={{padding: '20px'}}>
                <Text variant="header-1">{orgUnit.name}</Text>
                <Box>
                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                        {orgUnit.description}
                    </Text>
                </Box>
                <TabProvider value={tab} onUpdate={handleTabChange}>
                    <TabList>
                        <Tab value="info">Информация</Tab>
                        <Tab value="children">Дочерние организации</Tab>
                        <Tab value="users">Пользователи</Tab>
                    </TabList>
                    <TabPanel value="info">
                        <div style={{padding: '20px'}}>
                            <HorizontalStack align="center">
                                <Box marginRight="8px">
                                    <Icon data={Star} />
                                </Box>
                                <Text variant="caption-2" color="secondary">
                                    ID:
                                </Text>
                                <Text variant="body-1" color="primary">
                                    {orgUnit.id}
                                </Text>
                            </HorizontalStack>
                            <HorizontalStack align="center">
                                <Box marginRight="8px">
                                    <Icon data={Persons} />
                                </Box>
                                <Text variant="caption-2" color="secondary">
                                    Количество аккаунтов:
                                </Text>
                                <Text variant="body-1" color="primary">
                                    {orgUnitAccounts.length}
                                </Text>
                            </HorizontalStack>
                            <HorizontalStack align="center">
                                <Box marginRight="8px">
                                    <Icon data={Clock} />
                                </Box>
                                <Text variant="caption-2" color="secondary">
                                    Дата создания:
                                </Text>
                                <Text variant="body-1" color="primary">
                                    {orgUnit.createdAt}
                                </Text>
                            </HorizontalStack>
                            <HorizontalStack align="center">
                                <Box marginRight="8px">
                                    <Icon data={ClockArrowRotateLeft} />
                                </Box>
                                <Text variant="caption-2" color="secondary">
                                    Дата обновления:
                                </Text>
                                <Text variant="body-1" color="primary">
                                    {orgUnit.updatedAt}
                                </Text>
                            </HorizontalStack>
                        </div>
                    </TabPanel>
                    <TabPanel value="children">
                        <div style={{marginTop: '20px'}}>
                            {orgUnitTree && renderOrgUnitTree(orgUnitTree)}
                        </div>
                    </TabPanel>
                    <TabPanel value="users">
                        <div style={{marginTop: '20px'}}>
                            <AccountsTableSimple accounts={orgUnitAccounts} />
                        </div>
                    </TabPanel>
                </TabProvider>
            </div>
        </AsideComp>
    );
}
