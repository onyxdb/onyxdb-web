'use client';

import React, {useEffect, useState} from 'react';
import {rolesApi} from '@/app/apis';
import {RoleDTO} from '@/generated/api';
import {Table, TableColumnConfig, Text, TextInput, withTableSelection} from '@gravity-ui/uikit';

export interface RoleSelectionTableProps {
    selectedRoles: string[];
    onSelectChange: (selectedRoles: string[]) => void;
}

export const RoleSelectionTable: React.FC<RoleSelectionTableProps> = ({
    selectedRoles,
    onSelectChange,
}) => {
    const [roles, setRoles] = useState<RoleDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await rolesApi.getAllRoles({
                    search: searchQuery,
                    limit: 100, // Без пагинации
                });
                setRoles(response.data.data ?? []);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchRoles();
    }, [searchQuery]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const columns: TableColumnConfig<RoleDTO>[] = [
        {
            id: 'name',
            name: 'Название',
            template: (role) => role.name,
        },
        {
            id: 'description',
            name: 'Описание',
            template: (role) => role.description,
        },
    ];

    const MyTable = withTableSelection(Table);

    return (
        <div>
            <Text variant="header-2">Выбор ролей</Text>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по имени пользователя"
                    value={searchQuery}
                    onUpdate={handleSearch}
                />
            </div>
            <MyTable
                width="max"
                data={roles}
                // @ts-ignore
                columns={columns}
                getRowId={'id'}
                selectedIds={selectedRoles}
                onSelectionChange={onSelectChange}
            />
        </div>
    );
};

export default RoleSelectionTable;
