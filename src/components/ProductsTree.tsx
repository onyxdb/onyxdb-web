'use client';

import React from 'react';
import {productsApi} from '@/app/apis';
import {ProductDTO, ProductTreeDTO} from '@/generated/api';
import {ProductSmallCard} from '@/components/ProductSmallCard';
import {useRouter} from 'next/navigation';

interface ProductTreeProps {
    productId: string;
}

export function ProductTree({productId}: ProductTreeProps) {
    const router = useRouter();
    const [data, setData] = React.useState<ProductTreeDTO | null>(null);

    const fetchProductTree = async () => {
        try {
            const response = await productsApi.getProductTree({productId});
            setData(response.data);
        } catch (error) {
            console.error('Error fetching product tree:', error);
        }
    };

    React.useEffect(() => {
        fetchProductTree();
    }, [productId]);

    const handleProductSelect = (productDTO: ProductDTO) => {
        router.push('/products/view/' + productDTO.id);
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

    return <div style={{marginTop: '20px'}}>{data && renderProductTree([data])}</div>;
}
