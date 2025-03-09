'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi, organizationUnitsApi, productsApi} from '@/app/apis';
import {AccountDTO, OrganizationUnitDTO, ProductDTO, ProductTreeDTO} from '@/generated/api';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Button, Icon, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';
import {ProductSmallCard} from '@/components/products/ProductSmallCard';
import {ProductForm} from '@/components/formik/ProductForm';

interface ProductsPageProps {}

export default function ProductsPage({}: ProductsPageProps) {
    const [productsTree, setProductsTree] = useState<ProductTreeDTO[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
    const [selectedProductAccounts, setSelectedProductAccounts] = useState<AccountDTO[]>([]);
    const [selectedProductOrgUnits, setSelectedProductOrgUnits] = useState<OrganizationUnitDTO[]>(
        [],
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [ownerOptions, setOwnerOptions] = useState<AccountDTO[]>([]);
    const [parentProductOptions, setParentProductOptions] = useState<ProductDTO[]>([]);
    const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
    const [searchOwner, setSearchOwner] = useState<string | null>(null);
    const [selectedParentProductId, setSelectedParentProductId] = useState<string | null>(null);
    const [searchParentProduct, setSearchParentProduct] = useState<string | null>(null);
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {permissions} = usePermissions();

    const fetchProductsTree = async () => {
        try {
            const response = await productsApi.getAllProductTree();
            setProductsTree(response.data ?? []);
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
            fetchProductDetails(productIdFromPath);
        }
    }, [pathname, searchParams]);

    const fetchProductDetails = async (productId: string) => {
        try {
            const productResponse = await productsApi.getProductById({productId});
            setSelectedProduct(productResponse.data.data ?? null);

            const accountsResponse = await organizationUnitsApi.getAccountsByouId({
                ouId: productResponse.data.data?.id ?? '',
            });
            setSelectedProductAccounts(accountsResponse.data.data ?? []);

            const orgUnitsResponse = await organizationUnitsApi.getOrganizationUnitChildren({
                ouId: productResponse.data.data?.id ?? '',
            });
            setSelectedProductOrgUnits(orgUnitsResponse.data.data ?? []);
        } catch (error) {
            console.error('Error fetching product details:', error);
        }
    };

    useEffect(() => {
        const fetchOwnerOptions = async () => {
            if (searchOwner) {
                const response = await accountsApi.getAllAccounts({search: searchOwner, limit: 10});
                setOwnerOptions(response.data.data ?? []);
            }
        };

        fetchOwnerOptions();
    }, [searchOwner]);

    useEffect(() => {
        const fetchParentProductOptions = async () => {
            if (searchParentProduct) {
                const response = await productsApi.getAllProducts({
                    search: searchParentProduct,
                    limit: 10,
                });
                setParentProductOptions(response.data.data ?? []);
            }
        };

        fetchParentProductOptions();
    }, [searchParentProduct]);

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setSelectedOwnerId(null);
        setSelectedParentProductId(null);
        setSearchOwner(null);
        setSearchParentProduct(null);
    };

    const handleOwnerChange = (value: string) => {
        setSearchOwner(value);
    };

    const handleOwnerSelect = (account: AccountDTO) => {
        setSelectedOwnerId(account.id);
        setSearchOwner(`${account.firstName} ${account.lastName} (${account.email})`);
    };

    const handleParentProductChange = (value: string) => {
        setSearchParentProduct(value);
    };

    const handleParentProductSelect = (product: ProductDTO) => {
        setSelectedParentProductId(product.id);
        setSearchParentProduct(product.name);
    };

    const handleProductSelect = (productId: string) => {
        setSelectedProductId(productId);
        router.push(pathname + '?productId=' + productId);
    };

    const handleSubmitCreate = async (values: ProductDTO) => {
        try {
            await productsApi.createProduct({productDTO: values});
            handleCloseCreateModal();
            // Обновление дерева продуктов
            fetchProductsTree();
        } catch (error) {
            console.error('Ошибка при создании продукта:', error);
        }
    };

    const renderProductTree = (tree: ProductTreeDTO[]) => {
        if (!tree) return null;

        const renderItem = (item: ProductTreeDTO, level: number = 0) => {
            return (
                <div key={item.item.id} style={{marginLeft: `${level * 20}px`}}>
                    <ProductSmallCard product={item.item} onSelect={handleProductSelect} />
                    {item.children && item.children.length > 0 && (
                        <div>{item.children.map((child) => renderItem(child, level + 1))}</div>
                    )}
                </div>
            );
        };

        return <div>{tree.map((item) => renderItem(item))}</div>;
    };

    const renderProductDetails = () => {
        if (!selectedProduct) return null;

        return (
            <div style={{display: 'flex', flexDirection: 'row', gap: '20px'}}>
                <div style={{flex: 1}}>
                    <div style={{marginBottom: '20px'}}>
                        <Text variant="header-2">Основная информация</Text>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="user" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Имя:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {selectedProduct.name}
                            </Text>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="description" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Описание:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {selectedProduct.description}
                            </Text>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="email" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Email владельца:
                            </Text>
                            <Text variant="body-1" color="link">
                                {selectedProduct.ownerId}
                            </Text>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="clock" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Дата создания:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {new Date(selectedProduct.createdAt).toLocaleDateString()}
                            </Text>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="clock" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Дата обновления:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {new Date(selectedProduct.updatedAt).toLocaleDateString()}
                            </Text>
                        </div>
                    </div>
                </div>
                <div style={{flex: 1}}>
                    <div style={{marginBottom: '20px'}}>
                        <Text variant="header-2">Дополнительная информация</Text>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="folder" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Родительский продукт:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {selectedProduct.parentProductId}
                            </Text>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="users" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Количество сотрудников:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {selectedProductAccounts.length}
                            </Text>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <Icon glyph="folder" style={{marginRight: '8px'}} />
                            <Text variant="caption-2" color="secondary">
                                Количество подструктур:
                            </Text>
                            <Text variant="body-1" color="primary">
                                {selectedProductOrgUnits.length}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <div style={{marginBottom: '20px'}}>
                <Text variant="header-1">Продукты</Text>
            </div>
            <div style={{display: 'flex', marginBottom: '20px'}}>
                <div style={{flex: 1}}>
                    <TextInput
                        placeholder="Поиск продуктов"
                        value={searchQuery}
                        onUpdate={setSearchQuery}
                    />
                </div>
                {permissions['web-global-create'] && (
                    <Button
                        view="action"
                        size="m"
                        onClick={handleCreate}
                        style={{marginLeft: '10px'}}
                    >
                        Создать продукт
                    </Button>
                )}
            </div>
            <div style={{display: 'flex'}}>
                <div style={{width: '300px', marginRight: '20px'}}>
                    <div style={{marginBottom: '20px'}}>
                        <Text variant="header-2">Дерево продуктов</Text>
                    </div>
                    {renderProductTree(productsTree)}
                </div>
                <div style={{flex: 1}}>{selectedProduct && renderProductDetails()}</div>
            </div>
            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <h2>Создание нового продукта</h2>
                <ProductForm
                    onSubmit={handleSubmitCreate}
                    onClose={handleCloseCreateModal}
                    ownerOptions={ownerOptions}
                    parentProductOptions={parentProductOptions}
                    searchOwner={searchOwner}
                    onOwnerChange={handleOwnerChange}
                    onOwnerSelect={handleOwnerSelect}
                    searchParentProduct={searchParentProduct}
                    onParentProductChange={handleParentProductChange}
                    onParentProductSelect={handleParentProductSelect}
                />
                <Button view="normal" onClick={handleCloseCreateModal}>
                    Закрыть
                </Button>
            </Modal>
        </div>
    );
}
