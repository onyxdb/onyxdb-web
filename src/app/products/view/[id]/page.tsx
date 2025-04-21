'use client';

import React, {Suspense, useEffect, useState} from 'react';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Checkbox, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {mdbProjectsApi, productsApi} from '@/app/apis';
import {ProductDTOGet} from '@/generated/api';
import {ProductSmallCard} from '@/components/ProductSmallCard';
import {ProjectsTable} from '@/components/tables/ProjectsTable';
import {V1ProjectResponse} from '@/generated/api-mdb';
import {Box} from '@/components/Layout/Box';
import {ClustersTable} from '@/components/tables/ClustersTable';
import {AccountsTable} from '@/components/tables/AccountsTable';
import ProductInfoTab from '@/components/ProductInfoTab';
import ChartKit, {settings} from '@gravity-ui/chartkit';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import {MyLoader} from '@/components/Loader';
import QuotasTab from '@/app/products/view/[id]/QutasTab';

settings.set({plugins: [YagrPlugin]});

interface ProductTreeDTO {
    item: ProductDTOGet;
    children?: ProductTreeDTO[];
}

export default function ProductDetailPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const tab = searchParams.get('tab') || 'info';
    const productId = pathname.split('/').pop() ?? '';

    const [activeTab, setActiveTab] = useState(tab);
    const [product, setProduct] = useState<ProductDTOGet | null>(null);
    const [productParents, setProductParents] = useState<ProductDTOGet[]>([]);
    const [productTree, setProductTree] = useState<ProductTreeDTO | null>(null);
    const [projects, setProjects] = useState<V1ProjectResponse[]>([]);
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

    const fetchProductsTree = async (currentProductId: string) => {
        try {
            console.log('currentProductId', currentProductId);
            const response = await productsApi.getProductTree({productId: currentProductId});
            setProductTree(response.data);
        } catch (error) {
            console.error('Error fetching products tree:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await productsApi.getProductById({productId: productId});
            setProduct(response.data);
            if (response.data.id) {
                fetchProductParents(response.data.id);
                fetchProductsTree(response.data.id);
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
                    .filter((p) => showArchived || !p.isArchived)
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

    const handleProductSelect = (productDTO: ProductDTOGet) => {
        router.push('/products/view/' + productDTO.id);
    };

    const handleTabChange = (value: string) => {
        const createQueryString = (name: string, val: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, val);
            return params.toString();
        };
        setActiveTab(value);
        router.push(pathname + '?' + createQueryString('tab', value));
    };

    const renderProductTree = (tree: ProductTreeDTO[]) => {
        if (!tree) return null;
        const renderItem = (item: ProductTreeDTO, level = 0) => {
            return (
                <div key={item.item.id} style={{marginLeft: `${level * 30}px`}}>
                    <ProductSmallCard product={item.item} onSelect={handleProductSelect} />
                    {item.children && item.children.length > 0 && (
                        <div>{item.children.map((child) => renderItem(child, level + 1))}</div>
                    )}
                </div>
            );
        };
        return <div>{tree.map((item) => renderItem(item))}</div>;
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

    const data: YagrWidgetData = {
        data: {
            timeline: [
                1636838612441, 1636925012441, 1637011412441, 1637097812441, 1637184212441,
                1637270612441, 1637357012441, 1637443412441, 1637529812441, 1637616212441,
            ],
            graphs: [
                {
                    id: '1',
                    name: 'Serie 2',
                    color: '#6e8188',
                    data: [37, 6, 51, 10, 65, 35, 72, 0, 94, 54],
                },
                {
                    id: '0',
                    name: 'Serie 1',
                    color: '#6c59c2',
                    data: [25, 52, 89, 72, 39, 49, 82, 59, 36, 5],
                },
            ],
        },
        libraryConfig: {
            chart: {
                series: {
                    type: 'area',
                },
            },
            title: {
                text: 'line: random 10 pts',
            },
        },
    };

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
                        <div style={{marginTop: '20px'}}>
                            {productTree && renderProductTree([productTree])}
                        </div>
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
                            <QuotasTab productId={product.id} />
                        </div>
                    </TabPanel>
                    <TabPanel value="billing">
                        <Suspense fallback={<MyLoader />}>
                            <ChartKit type="yagr" data={data} />
                        </Suspense>
                    </TabPanel>
                </TabProvider>
            </div>
        </div>
    );
}
