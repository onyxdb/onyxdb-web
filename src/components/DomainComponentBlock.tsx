'use client';

import React from 'react';
import {Button, Card, Icon, Text} from '@gravity-ui/uikit';
import {Pencil, TrashBin} from '@gravity-ui/icons';
import {DomainComponentDTO} from '@/generated/api';
import {Box} from '@/components/Layout/Box';
import {useAuth} from '@/context/AuthContext';

interface DomainComponentProps {
    data: DomainComponentDTO;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
    isActive: boolean;
}

export const DomainComponentBlock: React.FC<DomainComponentProps> = ({
    data,
    onEdit,
    onDelete,
    onClick,
    isActive,
}) => {
    const {checkPermission} = useAuth();

    return (
        <Card
            type="selection"
            onClick={onClick}
            selected={isActive}
            style={{marginBottom: '10px', padding: '16px'}}
        >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <Text variant="header-1">{data.name}</Text>
                    <Box>
                        <Text variant="subheader-1" color="secondary" ellipsis={true}>
                            {data.description}
                        </Text>
                    </Box>
                </div>
                <Box marginLeft="10px">
                    {checkPermission('web-global-domain-components', 'create') && (
                        <Box marginBottom="5px">
                            <Button view="normal" size="m" onClick={() => onEdit(data.id ?? '???')}>
                                <Icon data={Pencil} />
                            </Button>
                        </Box>
                    )}
                    {checkPermission('web-global-domain-components', 'delete') && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => onDelete(data.id ?? '???')}
                        >
                            <Icon data={TrashBin} />
                        </Button>
                    )}
                </Box>
            </div>
        </Card>
    );
};
