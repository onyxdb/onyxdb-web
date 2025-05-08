'use client';

import React from 'react';
import {Button, Card, Icon, Label, Text} from '@gravity-ui/uikit';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ArrowUpFromSquare, TrashBin} from '@gravity-ui/icons';
import {useAuth} from '@/context/AuthContext';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {ProjectDTO} from '@/generated/api';
import ClustersTable from '@/components/tables/ClustersTable';

interface ProjectBlockProps {
    data: ProjectDTO;
    archiveAction: (id: string) => void;
    unArchiveAction: (id: string) => void;
}

export const ProjectBlock: React.FC<ProjectBlockProps> = ({
    data,
    archiveAction,
    unArchiveAction,
}) => {
    const {checkActions} = useAuth();

    return (
        <Card style={{padding: '16px'}}>
            <HorizontalStack justify="space-between">
                <VerticalStack>
                    <Text variant="subheader-3">
                        {data.name} {data.isArchived && <Label theme="warning">Архив</Label>}
                    </Text>
                    <Text variant="subheader-1" color="secondary">
                        {data.description?.split(' ').slice(0, 5).join(' ')}
                    </Text>
                </VerticalStack>
                <div style={{flexDirection: 'row'}}>
                    {/*{checkActions([*/}
                    {/*    {name: 'product', action: 'edit'},*/}
                    {/*    {name: `web-product-${data.id}`, action: 'edit'},*/}
                    {/*]) && (*/}
                    {/*    <Box marginBottom="5px">*/}
                    {/*        <Button view="normal" size="m" onClick={() => onEdit(data)}>*/}
                    {/*            <Icon data={Pencil} />*/}
                    {/*        </Button>*/}
                    {/*    </Box>*/}
                    {/*)}*/}
                    {checkActions([
                        {name: 'product', action: 'delete'},
                        {name: `web-product-${data.id}`, action: 'delete'},
                    ]) && data.isArchived ? (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => unArchiveAction(data.id)}
                        >
                            <Icon data={ArrowUpFromSquare} />
                        </Button>
                    ) : (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => archiveAction(data.id)}
                        >
                            <Icon data={TrashBin} />
                        </Button>
                    )}
                </div>
            </HorizontalStack>
            <ClustersTable projectsIds={[data.id]} />
        </Card>
    );
};
