'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {productsApi} from '@/app/apis';
import {ProductDTO, ProductTreeDTO} from '@/generated/api';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Modal, Text} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';
import {ProductSmallCard} from '@/components/ProductSmallCard';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ProductBlock} from '@/components/ProductBlock';
import {ProductForm, ProductFormFields} from '@/components/forms/ProductForm';
import {Box} from '@/components/Layout/Box';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {CirclePlus} from '@gravity-ui/icons';

interface ProductsPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function ProductsPage({}: ProductsPageProps) {
    const [productsTree, setProductsTree] = useState<ProductTreeDTO[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {checkPermission} = usePermissions();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams],
    );

    const handleProductSelect = (product: ProductDTO) => {
        setSelectedProduct(product);
        setSelectedProductId(product.id ?? '???');
        router.push(pathname + '?' + createQueryString('prId', product.id ?? '???'));
    };

    const handleProductCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    // const handleProductEditModal = () => {
    //     if (selectedProduct) {
    //         router.push(`/product/edit/${selectedProduct.id}`);
    //     }
    // };

    const handleProductEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const fetchProductsTree = async () => {
        try {
            const response = await productsApi.getAllProductTree();
            setProductsTree(response.data ?? []);
            if (response.data && response.data.length > 0 && response.data[0].item.id) {
                handleProductSelect(response.data[0].item);
            }
        } catch (error) {
            console.error('Error fetching products tree:', error);
        }
    };

    useEffect(() => {
        fetchProductsTree();
    }, []);

    useEffect(() => {
        const productIdFromPath = searchParams.get('productId');
        if (productIdFromPath) {
            setSelectedProductId(productIdFromPath);
        }
    }, [pathname, searchParams]);

    const fetchProductDetails = async (productId: string) => {
        try {
            const response = await productsApi.getProductById({productId});
            setSelectedProduct(response.data ?? null);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    useEffect(() => {
        if (selectedProductId) {
            fetchProductDetails(selectedProductId);
        }
    }, [selectedProductId]);

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

    const handleProductCreateSubmit = async (values: ProductFormFields) => {
        try {
            await productsApi.createProduct({
                productDTO: {
                    name: values.name,
                    description: values.description,
                    parentId: values.parentProductId,
                    ownerId: values.ownerAccountId,
                },
            });
            handleCloseCreateModal();
            await fetchProductsTree();
        } catch (error) {
            console.error('Ошибка при создании продукта:', error);
        }
    };

    const handleProductDelete = async (id: string) => {
        if (id) {
            await productsApi.deleteProduct({productId: id});
            await fetchProductsTree();
            if (selectedProduct?.id === id) {
                setSelectedProduct(null);
                setSelectedProductId(null);
            }
        }
    };

    const handleProductEditSubmit = async (values: ProductFormFields) => {
        if (selectedProductId) {
            await productsApi.updateProduct({
                productId: selectedProductId,
                productDTO: {
                    id: selectedProductId,
                    name: values.name,
                    description: values.description,
                    parentId: values.parentProductId,
                    ownerId: values.ownerAccountId,
                },
            });
            handleCloseEditModal();
            await fetchProductsTree();
        }
    };

    const breadCrumps = [
        {href: '/', text: 'Главная'},
        {href: '/products', text: 'Продукты'},
    ];

    const actions = [];
    if (checkPermission('web-global-product', 'create')) {
        actions.push({
            text: 'Создать продукт',
            action: handleProductCreateModal,
            icon: <CirclePlus />,
        });
    }
    return (
        <div>
            <AppHeader breadCrumps={breadCrumps} actions={actions} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Иерархия продуктов</Text>
                </Box>
                <HorizontalStack>
                    {renderProductTree(productsTree)}
                    <div style={{width: '400px', marginLeft: '20px'}}>
                        {selectedProduct && (
                            <ProductBlock
                                data={selectedProduct}
                                onEdit={handleProductEditModal}
                                onDelete={handleProductDelete}
                            />
                        )}
                    </div>
                </HorizontalStack>
                <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                    <ProductForm
                        onSubmit={handleProductCreateSubmit}
                        onClose={handleCloseCreateModal}
                    />
                </Modal>
                {selectedProduct && (
                    <Modal open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                        <ProductForm
                            onSubmit={handleProductEditSubmit}
                            onClose={handleCloseEditModal}
                            initialValue={selectedProduct}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
}
