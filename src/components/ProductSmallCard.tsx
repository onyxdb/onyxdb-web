'use client';

import React from 'react';
import {Card, Text} from '@gravity-ui/uikit';
import {ProductDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {Box} from '@/components/Layout/Box';

interface ProductSmallCardProps {
    product: ProductDTO;
    onSelect: (product: ProductDTO) => void;
}

export function ProductSmallCard({product, onSelect}: ProductSmallCardProps) {
    return (
        <Card
            type="selection"
            style={{marginBottom: '10px', padding: '10px'}}
            onClick={() => onSelect(product)}
        >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <VerticalStack>
                    <Text variant="subheader-3">{product.name}</Text>
                    <Text variant="subheader-1" color="secondary">
                        {product.description?.split(' ').slice(0, 5).join(' ')}
                    </Text>
                </VerticalStack>
                <Box marginLeft="10px" marginRight="10px">
                    {product.ownerId && <UserBlockWithFetch accountId={product.ownerId} size="s" />}
                </Box>
            </div>
        </Card>
    );
}
