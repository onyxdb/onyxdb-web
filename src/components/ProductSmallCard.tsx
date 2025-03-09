'use client';

import React from 'react';
import {Button, Card, Icon} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProductDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {Eye} from '@gravity-ui/icons';

interface ProductSmallCardProps {
    product: ProductDTO;
    onSelect: (productId: string) => void;
}

export const ProductSmallCard: React.FC<ProductSmallCardProps> = ({product, onSelect}) => {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/products/${product.id}`);
    };

    return (
        <Card
            style={{marginBottom: '10px', padding: '10px', cursor: 'pointer'}}
            onClick={() => onSelect(product.id ?? '???')}
        >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <div style={{fontWeight: 'bold'}}>{product.name}</div>
                    <div>{product.description?.split(' ').slice(0, 5).join(' ')}</div>
                    <div>
                        <UserBlockWithFetch accountId={product.ownerId ?? '???'} />
                    </div>
                </div>
                <Button view="normal" size="m" onClick={handleViewDetails}>
                    <Icon data={Eye} />
                </Button>
            </div>
        </Card>
    );
};
