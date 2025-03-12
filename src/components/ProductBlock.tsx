'use client';

import React from 'react';
import {Button, Card, Icon, Text} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProductDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {Eye, Pencil, TrashBin} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {VerticalStack} from '@/components/Layout/VerticalStack';

interface ProductBlockProps {
    data: ProductDTO;
    onEdit: (product: ProductDTO) => void;
    onDelete: (id: string) => void;
}

export const ProductBlock: React.FC<ProductBlockProps> = ({data, onEdit, onDelete}) => {
    const router = useRouter();
    const {checkActions} = useAuth();
    const handleViewDetails = (id: string) => {
        router.push(`/products/view/${id}`);
    };

    return (
        <Card style={{padding: '16px'}}>
            <Box>
                <HorizontalStack justify="space-between">
                    <VerticalStack>
                        <Text variant="subheader-3">{data.name}</Text>
                        <Text variant="subheader-1" color="secondary">
                            {data.description?.split(' ').slice(0, 5).join(' ')}
                        </Text>
                        <Box marginBottom="8px" marginTop="8px">
                            <strong>Владелец:</strong>
                            {data.ownerId ? (
                                <UserBlockWithFetch
                                    accountId={data.ownerId}
                                    selectable={true}
                                    size="l"
                                />
                            ) : (
                                'Not stated'
                            )}
                        </Box>
                    </VerticalStack>
                    <div style={{flexDirection: 'row'}}>
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
                <Button view="normal" size="l" onClick={() => handleViewDetails(data?.id ?? '???')}>
                    <Icon data={Eye} />
                    Подробнее
                </Button>
            </Box>
        </Card>
    );
};
