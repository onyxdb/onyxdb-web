'use client';

import React, {useState} from 'react';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {AccountDTO} from '@/generated/api';
import {accountsApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {useAuth} from '@/context/AuthContext';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface AccountSelectorProps {
    selectAccountAction: (account: AccountDTO) => void;
    header?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
    selectAccountAction,
    header = 'Поиск аккаунта',
    label = 'Аккаунт',
    placeholder = 'Введите и выберите аккаунт',
    disabled,
}) => {
    const {user} = useAuth();
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string>('');
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState<boolean>(false);

    const fetchAccountOptions = async () => {
        try {
            const response = await accountsApi.getAllAccounts({
                search: searchAccount,
                limit: 10,
            });
            setAccountOptions(response.data.data ?? []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    const handleAccountChange = (value: string) => {
        setSearchAccount(value);
        fetchAccountOptions();
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        selectAccountAction(data);
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
    };

    const handleOpenAccountsModal = () => {
        fetchAccountOptions();
        setIsAccountsModalOpen(true);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const handleAssignMe = () => {
        if (user?.account) {
            handleAccountSelect(user.account);
        }
    };

    if (disabled) {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>{label}</label>
                <TextInput
                    name="account"
                    value={searchAccount}
                    placeholder={placeholder}
                    onUpdate={handleAccountChange}
                    disabled={disabled}
                />
            </div>
        );
    }

    return (
        <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px'}}>{label}</label>
            <HorizontalStack align="center" gap={10}>
                <TextInput
                    name="account"
                    value={searchAccount}
                    placeholder={placeholder}
                    onUpdate={handleAccountChange}
                />
                <Button view="action" size="m" onClick={handleOpenAccountsModal}>
                    Поиск
                </Button>
                <Button view="normal" size="m" onClick={handleAssignMe}>
                    Назначить себя
                </Button>
            </HorizontalStack>
            <Modal open={isAccountsModalOpen} onOpenChange={handleCloseAccountsModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">{header}</Text>
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
                                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                        {item.email}
                                    </Text>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Button view="normal" onClick={handleCloseAccountsModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
