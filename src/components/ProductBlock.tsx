'use client';

import React, {useEffect, useState} from 'react';
import {Button, Card, Icon, Text} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProductDTO} from '@/generated/api';
import {UserBlockWithFetch} from '@/components/common/UserBlockWithFetch';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {Eye, Pencil, TrashBin} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {V1ProjectResponse} from '@/generated/api-mdb';
import {mdbProjectsApi} from '@/app/apis';

interface ProductBlockProps {
    data: ProductDTO;
    editAction: (product: ProductDTO) => void;
    deleteAction: (id: string) => void;
}

export const ProductBlock: React.FC<ProductBlockProps> = ({data, editAction, deleteAction}) => {
    const [projectsAll, setProjectsAll] = useState<V1ProjectResponse[]>([]);
    const router = useRouter();
    const {checkActions} = useAuth();

    const fetchProductProjects = async (productId: string) => {
        try {
            const response = await mdbProjectsApi.listProjects();
            setProjectsAll(response.data.projects.filter((p) => p.productId === productId) ?? []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    useEffect(() => {
        if (data.id) {
            fetchProductProjects(data.id);
        }
    }, [data.id]);

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
                        <Box marginBottom="16px" marginTop="16px">
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
                        <div>{projectsAll.map((project) => project.name)}</div>
                    </VerticalStack>
                    <div style={{flexDirection: 'row'}}>
                        {checkActions([
                            {name: 'product', action: 'edit'},
                            {name: `web-product-${data.id}`, action: 'edit'},
                        ]) && (
                            <Box marginBottom="5px">
                                <Button view="normal" size="m" onClick={() => editAction(data)}>
                                    <Icon data={Pencil} />
                                </Button>
                            </Box>
                        )}
                        {checkActions([
                            {name: 'product', action: 'delete'},
                            {name: `web-product-${data.id}`, action: 'delete'},
                        ]) && (
                            <Button
                                view="outlined-danger"
                                size="m"
                                onClick={() => deleteAction(data.id ?? '???')}
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
