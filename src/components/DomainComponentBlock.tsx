'use client';

import React from 'react';
import {Button, Card} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {Pencil} from '@gravity-ui/icons';

interface DomainComponentProps {
    id: string;
    name: string;
    onEdit: (id: string) => void;
}

export const DomainComponentBlock: React.FC<DomainComponentProps> = ({id, name, onEdit}) => {
    const router = useRouter();

    const handleEdit = () => {
        onEdit(id);
    };

    const handleViewDetails = () => {
        router.push(`/structure/${id}`);
    };

    return (
        <Card style={{marginBottom: '20px', width: '200px'}}>
            <div style={{padding: '16px'}}>
                <div style={{marginBottom: '12px', fontWeight: 'bold'}}>{name}</div>
                <div
                    style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                >
                    <Button view="normal" size="m" onClick={handleViewDetails}>
                        Подробнее
                    </Button>
                    <Button view="normal" size="m" onClick={handleEdit}>
                        <Pencil />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
