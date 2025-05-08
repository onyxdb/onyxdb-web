'use client';

import React, {useEffect, useState} from 'react';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {ProductDTO} from '@/generated/api';
import {productsApi} from '@/app/apis';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

interface ProductSelectorProps {
    selectProductAction: (product: ProductDTO) => void;
    initialValue?: ProductDTO;
    header?: string;
    label?: string;
    placeholder?: string;
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
    selectProductAction,
    initialValue,
    header = 'Поиск продукта',
    label = 'Продукт',
    placeholder = 'Введите и выберите продукт',
}) => {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isProductsModalOpen, setIsProductsModalOpen] = useState<boolean>(false);

    const fetchProductsAll = async () => {
        try {
            const response = await productsApi.getAllProducts({search: searchQuery});
            setProducts(response.data.data ?? []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        fetchProductsAll();
    }, [searchQuery]);

    const handleProductSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleProductSelect = (data: ProductDTO) => {
        console.log('ProductSelector handleProductSelect', data);
        setIsProductsModalOpen(false);
        selectProductAction(data);
        setSearchQuery(data.name);
    };

    const handleOpenProductsModal = () => {
        setIsProductsModalOpen(true);
    };

    const handleCloseProductsModal = () => {
        setIsProductsModalOpen(false);
    };

    useEffect(() => {
        if (initialValue) {
            handleProductSelect(initialValue);
        }
    }, [initialValue]);

    return (
        <div style={{marginBottom: '20px'}}>
            <Text variant="body-1">{label}</Text>
            <HorizontalStack align="center" gap={10}>
                <TextInput
                    name="product"
                    value={searchQuery}
                    placeholder={placeholder}
                    onUpdate={handleProductSearchChange}
                />
                <Button view="action" size="m" onClick={handleOpenProductsModal}>
                    Поиск
                </Button>
            </HorizontalStack>
            <Modal open={isProductsModalOpen} onOpenChange={handleCloseProductsModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">{header}</Text>
                    <Box marginTop="10px">
                        {products.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => handleProductSelect(item)}
                                style={{marginBottom: '10px', padding: '8px'}}
                            >
                                <div>
                                    <div>
                                        <Text variant="subheader-1" style={{marginRight: '10px'}}>
                                            {item.name}
                                        </Text>
                                    </div>
                                    <Text variant="body-1" color="secondary" ellipsis={true}>
                                        {item.description}
                                    </Text>
                                </div>
                            </Card>
                        ))}
                    </Box>
                    <Button view="normal" onClick={handleCloseProductsModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
