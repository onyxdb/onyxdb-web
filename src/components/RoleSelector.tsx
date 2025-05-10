'use client';

import React, {useState} from 'react';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {RoleDTO} from '@/generated/api';
import {rolesApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface RoleSelectorProps {
    selectRoleAction: (role: RoleDTO | null) => void;
    header?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
    selectRoleAction,
    header = 'Поиск роли',
    label = 'Роль',
    placeholder = 'Введите и выберите роль',
    disabled,
}) => {
    const [roleOptions, setRoleOptions] = useState<RoleDTO[]>([]);
    const [searchRole, setSearchRole] = useState<string>('');
    const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(false);

    const fetchRoleOptions = async () => {
        try {
            const response = await rolesApi.getAllRoles({
                search: searchRole,
                limit: 10,
            });
            setRoleOptions(response.data.data ?? []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const handleRoleChange = (value: string) => {
        if (value.length === 0) {
            selectRoleAction(null);
        }
        setSearchRole(value);
        fetchRoleOptions();
    };

    const handleRoleSelect = (data: RoleDTO) => {
        setIsRoleModalOpen(false);
        selectRoleAction(data);
        setSearchRole(`${data.name}`);
    };

    const handleOpenRoleModal = () => {
        fetchRoleOptions();
        setIsRoleModalOpen(true);
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
    };

    if (disabled) {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>{label}</label>
                <TextInput
                    name="role"
                    value={searchRole}
                    placeholder={placeholder}
                    onUpdate={handleRoleChange}
                    disabled={disabled}
                    hasClear={true}
                />
            </div>
        );
    }

    return (
        <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px'}}>{label}</label>
            <HorizontalStack align="center" gap={10}>
                <TextInput
                    name="role"
                    value={searchRole}
                    placeholder={placeholder}
                    onUpdate={handleRoleChange}
                    hasClear={true}
                />
                <Button view="action" size="m" onClick={handleOpenRoleModal}>
                    Поиск
                </Button>
            </HorizontalStack>
            <Modal open={isRoleModalOpen} onOpenChange={handleCloseRoleModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">{header}</Text>
                    <Box marginTop="10px">
                        {roleOptions.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => handleRoleSelect(item)}
                                style={{marginBottom: '10px', padding: '16px'}}
                            >
                                <Text variant="header-1">{item.name}</Text>
                                <Box>
                                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                        {item.description}
                                    </Text>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Button view="normal" onClick={handleCloseRoleModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
