'use client';

import React, {useEffect, useState} from 'react';
import {List, TextInput} from '@gravity-ui/uikit';
import {organizationUnitsApi} from '@/app/apis';

interface OrganizationUnitSelectorProps {
    onSelect: (organizationUnitId: string) => void;
}

export const OrganizationUnitSelector: React.FC<OrganizationUnitSelectorProps> = ({onSelect}) => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [organizationUnits, setOrganizationUnits] = useState<any[]>([]);

    useEffect(() => {
        organizationUnitsApi
            .getAllOrganizationUnits()
            .then((response) => {
                setOrganizationUnits(response.data);
            })
            .catch((error) => console.error('Error fetching organization units:', error));
    }, []);

    const listItems = organizationUnits.map((unit) => ({
        id: unit.id,
        title: unit.name,
    }));

    const handleItemClick = (item: {id: string; title: string}) => {
        onSelect(item.id);
    };

    return (
        <div>
            <TextInput
                placeholder="Поиск по названию"
                value={searchQuery}
                onUpdate={(value) => setSearchQuery(value)}
                style={{marginBottom: '10px'}}
            />
            <List
                items={listItems}
                onItemClick={handleItemClick}
                renderItem={(item) => (
                    <div style={{padding: '8px', cursor: 'pointer'}}>
                        <div>{item.title}</div>
                    </div>
                )}
                itemHeight={() => 36}
                itemsHeight={160}
                filterItem={(filter) => (item) => item.title.includes(filter)}
            />
        </div>
    );
};
