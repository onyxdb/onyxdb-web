'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {AccountDTO, ProductDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {accountsApi, productsApi} from '@/app/apis';

interface ProductFormProps {
    onSubmit: (values: ProductFormFields) => void;
    closeAction: () => void;
    initialValue?: ProductDTO;
}

export interface ProductFormFields {
    name: string;
    description: string;
    parentProduct: string;
    parentProductId: string;
    ownerAccount: string;
    ownerAccountId: string;
}

function mapDTOtoFormFields(dto: ProductDTO): ProductFormFields {
    return {
        name: dto.name,
        description: dto.description,
        ownerAccount: dto.ownerId ?? '',
        ownerAccountId: dto.ownerId ?? '',
        parentProduct: dto.parentId ?? '',
        parentProductId: dto.parentId ?? '',
    };
}

export const ProductForm: React.FC<ProductFormProps> = ({onSubmit, closeAction, initialValue}) => {
    const [parentProductOptions, setParentProductOptions] = useState<ProductDTO[]>([]);
    const [searchParentProduct, setSearchParentProduct] = useState<string | null>(null);
    const [selectedParentProductId, setSelectedParentProductId] = useState<string | null>(
        initialValue?.parentId ?? null,
    );

    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
        initialValue?.ownerId ?? null,
    );

    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
    const [isParentProductModalOpen, setIsParentProductModalOpen] = useState(false);

    const formik = useFormik<ProductFormFields>({
        initialValues: initialValue
            ? mapDTOtoFormFields(initialValue)
            : {
                  name: '',
                  description: '',
                  parentProduct: '',
                  parentProductId: '',
                  ownerAccount: '',
                  ownerAccountId: '',
              },
        validate: (values) => {
            const errors: Partial<ProductFormFields> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            if (!values.ownerAccount || !values.ownerAccountId) {
                errors.ownerAccount = 'Владелец обязателен';
            }
            return errors;
        },
        onSubmit,
    });

    const handleAccountChange = (value: string) => {
        setSearchAccount(value);
        formik.setFieldValue('ownerAccount', value);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        setSelectedAccountId(data.id);
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
        formik.setFieldValue('ownerAccount', `${data.firstName} ${data.lastName} (${data.email})`);
        formik.setFieldValue('ownerAccountId', data.id);
    };

    const handleParentProductChange = (value: string) => {
        setSearchParentProduct(value);
    };

    const handleParentProductSelect = (product: ProductDTO) => {
        setIsParentProductModalOpen(false);
        setSelectedParentProductId(product.id);
        setSearchParentProduct(product.name);
        formik.setFieldValue('parentProduct', product.name);
        formik.setFieldValue('parentProductId', product.id);
    };

    const fetchInitialValues = async (data: ProductDTO) => {
        try {
            const ownerAccount = data.ownerId
                ? await accountsApi.getAccountById({accountId: data.ownerId})
                : null;
            const parentProduct = data.parentId
                ? await productsApi.getProductById({productId: data.parentId})
                : null;

            if (ownerAccount?.data) {
                handleAccountSelect(ownerAccount.data);
            }
            if (parentProduct?.data) {
                handleParentProductSelect(parentProduct.data);
            }
        } catch (error) {
            console.error('Error fetching products tree:', error);
        }
    };

    useEffect(() => {
        if (initialValue) {
            fetchInitialValues(initialValue);
        }
    }, [initialValue]);

    const fetchAccountOptions = async () => {
        const response = await accountsApi.getAllAccounts({
            search: searchAccount ?? '',
            limit: 10,
        });
        setAccountOptions(response.data.data ?? []);
    };

    const fetchParentProductOptions = async () => {
        const response = await productsApi.getAllProducts({
            search: searchParentProduct ?? '',
            limit: 10,
        });
        setParentProductOptions(response.data.data ?? []);
    };

    const handleOpenAccountsModal = () => {
        fetchAccountOptions();
        setIsAccountsModalOpen(true);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const handleOpenParentProductModal = () => {
        fetchParentProductOptions();
        setIsParentProductModalOpen(true);
    };

    const handleCloseParentProductModal = () => {
        setIsParentProductModalOpen(false);
    };

    const renderAccountsSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Владелец</label>
                <TextInput
                    name="ownerAccount"
                    value={searchAccount ?? selectedAccountId ?? ''}
                    onUpdate={handleAccountChange}
                    onBlur={formik.handleBlur('ownerAccount')}
                    error={formik.touched.ownerAccount ? formik.errors.ownerAccount : undefined}
                    placeholder="Введите и выберите владельца"
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
                        <Text variant="header-1">Поиск аккаунта владельца</Text>
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
                        <div>
                            <Button view="normal" onClick={handleCloseAccountsModal}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };

    const renderParentProductSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Родительский Продукт</label>
                <TextInput
                    name="parentProduct"
                    value={searchParentProduct ?? selectedParentProductId ?? ''}
                    onUpdate={handleParentProductChange}
                    onBlur={formik.handleBlur('parentOu')}
                    error={formik.touched.parentProduct ? formik.errors.parentProduct : undefined}
                    placeholder="Введите и выберите родительский Продукт"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenParentProductModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск Продуктов
                </Button>
                <Modal open={isParentProductModalOpen} onOpenChange={handleCloseParentProductModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск Продуктов</Text>
                        <Box marginTop="10px">
                            {parentProductOptions
                                // .filter((item) =>
                                //     `${item.name}|${item.description}`
                                //         .toLowerCase()
                                //         .includes(searchPOu?.toLowerCase() ?? ''),
                                // )
                                .map((item) => (
                                    <Card
                                        key={item.id}
                                        type="selection"
                                        onClick={() => handleParentProductSelect(item)}
                                        style={{marginBottom: '10px', padding: '16px'}}
                                    >
                                        <Text variant="header-1">{item.name}</Text>
                                        <Box>
                                            <Text
                                                variant="subheader-1"
                                                color="secondary"
                                                ellipsis={true}
                                            >
                                                {item.description}
                                            </Text>
                                        </Box>
                                    </Card>
                                ))}
                        </Box>
                        <Button view="normal" onClick={handleCloseParentProductModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>{initialValue ? 'Редактирование продукта' : 'Создание нового продукта'}</h1>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name}
                    onChange={(value) => formik.setFieldValue('name', value)}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name ? formik.errors.name : undefined}
                    placeholder="Введите название"
                />
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                />
                {renderAccountsSelector()}
                {renderParentProductSelector()}
                <HorizontalStack>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Box marginLeft="20px">
                        <Button
                            view="normal"
                            size="l"
                            disabled={formik.isSubmitting}
                            onClick={closeAction}
                        >
                            Отменить
                        </Button>
                    </Box>
                </HorizontalStack>
            </form>
        </div>
    );
};
