'use client';

import React, {useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO, BusinessRoleDTO} from '@/generated/api';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

export interface BusinessRoleAssignModalProps {
    businessRole: BusinessRoleDTO;
    onCancel: () => void;
}

export const BusinessRoleAssignModal: React.FC<BusinessRoleAssignModalProps> = ({
    businessRole,
    onCancel,
}) => {
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

    const handleAccountChange = (value: string) => {
        setSearchAccount(value);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        setSelectedAccountId(data.id ?? '');
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
    };

    const fetchAccountOptions = async () => {
        const response = await accountsApi.getAllAccounts({
            search: searchAccount ?? '',
            limit: 10,
        });
        setAccountOptions(response.data.data ?? []);
    };

    const handleOpenAccountsModal = () => {
        fetchAccountOptions();
        setIsAccountsModalOpen(true);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const handleAssignRole = async () => {
        if (selectedAccountId) {
            try {
                await accountsApi.addBusinessRoleToAccount({
                    accountId: selectedAccountId,
                    businessRoleId: businessRole.id ?? '',
                });
                onCancel();
            } catch (error) {
                console.error('Failed to assign business role to account:', error);
            }
        }
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Выдача бизнес-роли: {businessRole.name}</h1>
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Аккаунт</label>
                <TextInput
                    name="account"
                    value={searchAccount ?? ''}
                    onUpdate={handleAccountChange}
                    placeholder="Введите и выберите аккаунт"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenAccountsModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск аккаунта
                </Button>
                <Modal open={isAccountsModalOpen} onOpenChange={handleCloseAccountsModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск аккаунта</Text>
                        <Box marginTop="10px">
                            {accountOptions.map((item) => (
                                <Card
                                    key={item.id}
                                    type="selection"
                                    onClick={() => handleAccountSelect(item)}
                                    style={{marginBottom: '10px', padding: '16px'}}
                                >
                                    <Text variant="header-1">{`${item.firstName} ${item.lastName}`}</Text>
                                    <Box>
                                        <Text
                                            variant="subheader-1"
                                            color="secondary"
                                            ellipsis={true}
                                        >
                                            {item.email}
                                        </Text>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                        <Button view="normal" onClick={fetchAccountOptions}>
                            Обновить поиск
                        </Button>
                        <Button view="normal" onClick={handleCloseAccountsModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            </div>
            <HorizontalStack>
                <Button view="normal" size="l" onClick={onCancel}>
                    Отмена
                </Button>
                <Box marginLeft="20px">
                    <Button
                        view="outlined-success"
                        size="l"
                        onClick={handleAssignRole}
                        disabled={!selectedAccountId}
                    >
                        Выдать
                    </Button>
                </Box>
            </HorizontalStack>
        </div>
    );
};

export default BusinessRoleAssignModal;
