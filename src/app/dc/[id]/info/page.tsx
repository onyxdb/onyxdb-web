'use client';

import React, {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {ProductDTO, ProductsApi} from '@/generated/api';

export default function ProductInfoPage() {
    const params = useParams();
    const productId = params.id as string;
    const [product, setProduct] = useState<ProductDTO | null>(null);

    useEffect(() => {
        const productsApi = new ProductsApi();
        productsApi
            .getProductById({productId})
            .then((response) => setProduct(response.data))
            .catch((error) => console.error('Error fetching product:', error));
    }, [productId]);

    if (!product) {
        return <div>Загрузка...</div>;
    }

    return (
        <div style={{padding: '20px'}}>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>Дата создания: {product.createdAt}</p>
            <p>Владелец: {product.ownerId}</p>
        </div>
    );
}
