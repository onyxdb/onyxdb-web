// components/CreateRoleRequestModal.js

'use client';

import React, {useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {AccountDTO, RoleDTO} from '@/generated/api'; // Убедитесь, что путь к моделям правильный
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {accountsApi, rolesRequestsApi} from '@/app/apis'; // Убедитесь, что путь к API правильный

interface CreateRoleRequestModalProps {
    role: RoleDTO;
    onCancel: () => void;
}

export interface CreateRoleRequestFormFields {
    reason: string;
    accountId: string;
}

export const CreateRoleRequestModal: React.FC<CreateRoleRequestModalProps> = ({role, onCancel}) => {
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

    const formik = useFormik<CreateRoleRequestFormFields>({
        initialValues: {
            reason: '',
            accountId: '',
        },
        validate: (values) => {
            const errors: Partial<CreateRoleRequestFormFields> = {};
            if (!values.reason) {
                errors.reason = 'Причина обязательна';
            }
            if (!values.accountId) {
                errors.accountId = 'Аккаунт обязателен';
            }
            return errors;
        },
        onSubmit: async (values) => {
            try {
                if (selectedAccountId) {
                    await rolesRequestsApi.createRoleRequest({
                        roleRequestPostDTO: {
                            roleId: role.id ?? '',
                            accountId: values.accountId,
                            ownerId: selectedAccountId,
                            reason: values.reason,
                            status: 'WAITING', // Замените на реальный статус
                        },
                    });
                    onCancel();
                }
            } catch (error) {
                console.error('Failed to create role request:', error);
            }
        },
    });

    const handleAccountChange = (value: string) => {
        setSearchAccount(value);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        setSelectedAccountId(data.id);
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
        formik.setFieldValue('accountId', data.id);
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

    const renderAccountsSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Аккаунт</label>
                <TextInput
                    name="account"
                    value={searchAccount ?? ''}
                    onUpdate={handleAccountChange}
                    onBlur={formik.handleBlur('accountId')}
                    error={formik.touched.accountId ? formik.errors.accountId : undefined}
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
                        <Button view="normal" onClick={handleCloseAccountsModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Заказ роли: {role.name}</h1>
            <form onSubmit={formik.handleSubmit}>
                <TextAreaField
                    label="Причина"
                    name="reason"
                    value={formik.values.reason}
                    onChange={(value) => formik.setFieldValue('reason', value)}
                    onBlur={formik.handleBlur('reason')}
                    error={formik.touched.reason ? formik.errors.reason : undefined}
                    placeholder="Введите причину"
                />
                {renderAccountsSelector()}
                <HorizontalStack>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Сохранение...' : 'Создать заявку'}
                    </Button>
                    <Box marginLeft="20px">
                        <Button
                            view="normal"
                            size="l"
                            disabled={formik.isSubmitting}
                            onClick={onCancel}
                        >
                            Отмена
                        </Button>
                    </Box>
                </HorizontalStack>
            </form>
        </div>
    );
};

export default CreateRoleRequestModal;
