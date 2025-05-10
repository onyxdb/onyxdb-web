import React from 'react';
import {Icon, Text} from '@gravity-ui/uikit';
import {ProductDTO} from '@/generated/api';
import {Box} from '@/components/Layout/Box';
import {Clock, ClockArrowRotateLeft, Handset} from '@gravity-ui/icons';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface ProductInfoTabProps {
    product: ProductDTO;
}

export const ProductInfoTab: React.FC<ProductInfoTabProps> = ({product}) => {
    return (
        <div style={{padding: '20px'}}>
            <HorizontalStack align="center">
                <Box marginRight="8px">
                    <Icon data={Handset} />
                </Box>
                <Text variant="caption-2" color="secondary">
                    ID:
                </Text>
                <Text variant="body-1" color="primary">
                    {product.id}
                </Text>
            </HorizontalStack>
            <HorizontalStack align="center">
                <Box marginRight="8px">
                    <Icon data={Clock} />
                </Box>
                <Text variant="caption-2" color="secondary">
                    Дата создания:
                </Text>
                <Text variant="body-1" color="primary">
                    {product.createdAt}
                </Text>
            </HorizontalStack>
            <HorizontalStack align="center">
                <Box marginRight="8px">
                    <Icon data={ClockArrowRotateLeft} />
                </Box>
                <Text variant="caption-2" color="secondary">
                    Дата обновления:
                </Text>
                <Text variant="body-1" color="primary">
                    {product.updatedAt}
                </Text>
            </HorizontalStack>
        </div>
    );
};

export default ProductInfoTab;
