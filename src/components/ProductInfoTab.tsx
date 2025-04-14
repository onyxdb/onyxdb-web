'use client';

import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {ProductDTO} from '@/generated/api';

interface ProductInfoTabProps {
    product: ProductDTO;
}

export const ProductInfoTab: React.FC<ProductInfoTabProps> = ({product}) => {
    return (
        <div style={{padding: '20px'}}>
            <Text variant="header-2">Информация о продукте</Text>
            <div style={{marginTop: '20px'}}>
                <Text variant="subheader-1">Название:</Text>
                <Text variant="body-1">{product.name}</Text>
            </div>
            <div style={{marginTop: '20px'}}>
                <Text variant="subheader-1">Описание:</Text>
                <Text variant="body-1">{product.description}</Text>
            </div>
            <div style={{marginTop: '20px'}}>
                <Text variant="subheader-1">ID:</Text>
                <Text variant="body-1">{product.id}</Text>
            </div>
            <div style={{marginTop: '20px'}}>
                <Text variant="subheader-1">Дата создания:</Text>
                <Text variant="body-1">{product.createdAt}</Text>
            </div>
            <div style={{marginTop: '20px'}}>
                <Text variant="subheader-1">Дата обновления:</Text>
                <Text variant="body-1">{product.updatedAt}</Text>
            </div>
        </div>
    );
};

export default ProductInfoTab;
