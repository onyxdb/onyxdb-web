'use client';

import React from 'react';
import {Button, Card, Icon} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProductDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {Pencil, TrashBin} from '@gravity-ui/icons';
import {usePermissions} from '@/hooks/usePermissions';

interface ProductBlockProps {
    data: ProductDTO;
    onEdit: (product: ProductDTO) => void;
    onDelete: (id: string) => void;
}

export const ProductBlock: React.FC<ProductBlockProps> = ({data, onEdit, onDelete}) => {
    const router = useRouter();
    const {checkActions} = usePermissions();
    const handleViewDetails = (id: string) => {
        router.push(`/products/view/${id}`);
    };

    return (
        <Card style={{padding: '16px'}}>
            <div style={{marginBottom: '12px'}}>
                <HorizontalStack justify="space-between">
                    <h2>{data.name}</h2>
                    <div>
                        {checkActions([
                            {name: 'web-global-product', action: 'edit'},
                            {name: `web-product-${data.id}`, action: 'edit'},
                        ]) && (
                            <Box marginBottom="5px">
                                <Button view="normal" size="m" onClick={() => onEdit(data)}>
                                    <Icon data={Pencil} />
                                </Button>
                            </Box>
                        )}
                        {checkActions([
                            {name: 'web-global-product', action: 'delete'},
                            {name: `web-product-${data.id}`, action: 'delete'},
                        ]) && (
                            <Button
                                view="outlined-danger"
                                size="m"
                                onClick={() => onDelete(data.id ?? '???')}
                            >
                                <Icon data={TrashBin} />
                            </Button>
                        )}
                    </div>
                </HorizontalStack>
                <Box marginBottom="8px">
                    <strong>Описание:</strong> {data.description}
                </Box>
                <Box marginBottom="8px">
                    <strong>Владелец:</strong>
                    {data.ownerId ? (
                        <UserBlockWithFetch accountId={data.ownerId} selectable={true} size="l" />
                    ) : (
                        'Not stated'
                    )}
                </Box>
                <Button view="normal" size="l" onClick={() => handleViewDetails(data?.id ?? '???')}>
                    Подробнее
                </Button>
            </div>
        </Card>
    );
};
