'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {productsApi} from '@/app/apis';
import {ProductDTO} from '@/generated/api';
import ProductInfoTab from '@/components/ProductInfoTab';
import {ProductSmallCard} from '@/components/ProductSmallCard';
import ClustersTable from '@/components/tables/ClustersTable';
import {AccountsTable} from '@/components/tables/AccountsTable';

interface ProductTreeDTO {
    item: ProductDTO;
    children?: ProductTreeDTO[];
}

export default function ProductDetailPage() {
    const router = useRouter();
    const pathname = usePathname();
    const productId = pathname.split('/').pop() ?? '';
    const [activeTab, setActiveTab] = useState('info');
    const [product, setProduct] = useState<ProductDTO | null>(null);
    const [productParents, setProductParents] = useState<ProductDTO[]>([]);
    const [productTree, setProductTree] = useState<ProductTreeDTO | null>(null);

    const handleProductSelect = (productDTO: ProductDTO) => {
        router.push('/products/view/' + productDTO.id);
    };

    const fetchProductParents = async (currentProductId: string) => {
        try {
            const response = await productsApi.getProductParents({productId: currentProductId});
            setProductParents(response.data);
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

    useEffect(() => {
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

        fetchProduct();
    }, [productId]);

    if (!product) {
        return <div>Продукт не найден</div>;
    }

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

    const breadCrumps = [
        {href: '/', text: 'Главная'},
        {href: '/products', text: 'Продукты'},
        ...productParents.map((parent) => ({
            href: `/products/view/${parent.id}`,
            text: parent.name,
        })),
    ];

    return (
        <div>
            <AppHeader breadCrumps={breadCrumps} actions={[]} />
            <div style={{padding: '20px'}}>
                <TabProvider value={activeTab} onUpdate={setActiveTab}>
                    <TabList>
                        <Tab value="info">Информация</Tab>
                        <Tab value="children">Дочерние продукты</Tab>
                        <Tab value="clusters">Кластеры</Tab>
                        <Tab value="users">Пользователи</Tab>
                    </TabList>
                    <TabPanel value="info">
                        {product && <ProductInfoTab product={product} />}
                    </TabPanel>
                    <TabPanel value="children">
                        <div style={{marginTop: '20px'}}>
                            <Text variant="header-2">Дочерние продукты</Text>
                        </div>
                        <div style={{marginTop: '20px'}}>
                            {productTree && renderProductTree([productTree])}
                        </div>
                    </TabPanel>
                    <TabPanel value="clusters">
                        {product?.id && <ClustersTable projectId={product.id} />}
                    </TabPanel>
                    <TabPanel value="users">
                        <div style={{marginTop: '20px'}}>
                            <Text variant="header-2">Пользователи</Text>
                        </div>
                        <AccountsTable />
                    </TabPanel>
                </TabProvider>
            </div>
        </div>
    );
}
