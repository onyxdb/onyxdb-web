'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Checkbox, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {mdbProjectsApi, productsApi} from '@/app/apis';
import {ProductDTO, ProjectDTO} from '@/generated/api';
import {ProjectsTable} from '@/components/tables/ProjectsTable';
import {Box} from '@/components/Layout/Box';
import {ClustersTable} from '@/components/tables/ClustersTable';
import {AccountsTable} from '@/components/tables/AccountsTable';
import ProductInfoTab from '@/components/ProductInfoTab';
import QuotasTab from '@/components/QutasTab';
import BillingTab from '@/components/BillingTab';
import {ProductTree} from '@/components/ProductsTree';

export default function ProductDetailPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'info';
    const productId = pathname.split('/').pop() ?? '';

    const [activeTab, setActiveTab] = useState(tab);
    const [product, setProduct] = useState<ProductDTO | null>(null);
    const [productParents, setProductParents] = useState<ProductDTO[]>([]);
    const [projects, setProjects] = useState<ProjectDTO[]>([]);
    const [showArchived, setShowArchived] = useState<boolean>(true);

    const fetchProductParents = async (currentProductId: string) => {
        try {
            const response = await productsApi.getProductParents({productId: currentProductId});
            const reversedData = response.data.reverse();
            setProductParents(reversedData);
        } catch (error) {
            console.error('Error fetching product parents:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await productsApi.getProductById({productId: productId});
            setProduct(response.data);
            if (response.data.id) {
                fetchProductParents(response.data.id);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await mdbProjectsApi.listProjects();
            setProjects(
                response.data.projects
                    .filter((p) => showArchived || !p.isDeleted)
                    .filter((p) => productId === null || p.productId === productId),
            );
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    useEffect(() => {
        setActiveTab(tab);
    }, [tab]);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    useEffect(() => {
        fetchProjects();
    }, [productId, showArchived]);

    const handleTabChange = (value: string) => {
        const createQueryString = (name: string, val: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, val);
            return params.toString();
        };
        setActiveTab(value);
        router.push(pathname + '?' + createQueryString('tab', value));
    };

    const handleShowArchivedChange = (checked: boolean) => {
        setShowArchived(checked);
        fetchProjects();
    };

    if (!product) {
        return <div>Продукт не найден</div>;
    }

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/products', text: 'Продукты'},
        ...productParents.map((parent) => ({
            href: `/products/view/${parent.id}`,
            text: parent.name,
        })),
    ];

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={[]} />
            <div style={{padding: '20px'}}>
                <Text variant="header-1">{product.name}</Text>
                <Box>
                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                        {product.description}
                    </Text>
                </Box>
                <TabProvider value={activeTab} onUpdate={handleTabChange}>
                    <TabList>
                        <Tab value="info">Информация</Tab>
                        <Tab value="children">Дочерние продукты</Tab>
                        <Tab value="projects">Проекты</Tab>
                        <Tab value="clusters">Кластеры</Tab>
                        <Tab value="users">Пользователи</Tab>
                        <Tab value="quotas">Квоты</Tab>
                        <Tab value="billing">Биллинг</Tab>
                    </TabList>
                    <TabPanel value="info">
                        {product && <ProductInfoTab product={product} />}
                    </TabPanel>
                    <TabPanel value="children">
                        {product && <ProductTree productId={product.id} />}
                    </TabPanel>
                    <TabPanel value="projects">
                        <Box marginTop={20} marginBottom={16}>
                            <Checkbox
                                size="l"
                                checked={showArchived}
                                onUpdate={handleShowArchivedChange}
                            >
                                Показывать архивные проекты
                            </Checkbox>
                        </Box>
                        <ProjectsTable projects={projects} />
                    </TabPanel>
                    <TabPanel value="clusters">
                        <div style={{marginTop: '20px'}}>
                            {product?.id && (
                                <ClustersTable projectsIds={projects.map((p) => p.id)} />
                            )}
                        </div>
                    </TabPanel>
                    <TabPanel value="users">
                        <div style={{marginTop: '20px'}}>
                            <AccountsTable />
                        </div>
                    </TabPanel>
                    <TabPanel value="quotas">
                        <div style={{marginTop: '20px'}}>
                            <QuotasTab product={product} />
                        </div>
                    </TabPanel>
                    <TabPanel value="billing">
                        <BillingTab product={product} />
                    </TabPanel>
                </TabProvider>
            </div>
        </div>
    );
}
