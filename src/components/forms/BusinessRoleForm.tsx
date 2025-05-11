'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {BusinessRoleDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {businessRolesApi} from '@/app/apis';

interface BusinessRoleFormProps {
    submitAction: (values: BusinessRoleFormFields) => void;
    closeAction: () => void;
    initialValue?: BusinessRoleDTO;
}

export interface BusinessRoleFormFields {
    name: string;
    shopName: string;
    description: string;
    parentBusinessRole: string;
    parentBusinessRoleId: string;
}

function mapDTOtoFormFields(dto: BusinessRoleDTO): BusinessRoleFormFields {
    return {
        name: dto.name,
        shopName: dto.shopName,
        description: dto.description,
        parentBusinessRole: dto.parentId ? dto.name : '',
        parentBusinessRoleId: dto.parentId ?? '',
    };
}

export const BusinessRoleForm: React.FC<BusinessRoleFormProps> = ({
    submitAction,
    closeAction,
    initialValue,
}) => {
    const [parentBusinessRoleOptions, setParentBusinessRoleOptions] = useState<BusinessRoleDTO[]>(
        [],
    );
    const [searchParentBusinessRole, setSearchParentBusinessRole] = useState<string | null>(null);
    const [selectedParentBusinessRoleId, setSelectedParentBusinessRoleId] = useState<string | null>(
        initialValue?.parentId ?? null,
    );

    const [isParentBusinessRoleModalOpen, setIsParentBusinessRoleModalOpen] = useState(false);

    const formik = useFormik<BusinessRoleFormFields>({
        initialValues: initialValue
            ? mapDTOtoFormFields(initialValue)
            : {
                  name: '',
                  shopName: '',
                  description: '',
                  parentBusinessRole: '',
                  parentBusinessRoleId: '',
              },
        validate: (values) => {
            const errors: Partial<BusinessRoleFormFields> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            return errors;
        },
        onSubmit: submitAction,
    });

    const handleParentBusinessRoleChange = (value: string) => {
        setSearchParentBusinessRole(value);
    };

    const handleParentBusinessRoleSelect = (businessRole: BusinessRoleDTO) => {
        setIsParentBusinessRoleModalOpen(false);
        setSelectedParentBusinessRoleId(businessRole.id);
        setSearchParentBusinessRole(businessRole.name);
        formik.setFieldValue('parentBusinessRole', businessRole.name);
        formik.setFieldValue('parentBusinessRoleId', businessRole.id);
    };

    const fetchInitialValues = async (data: BusinessRoleDTO) => {
        try {
            const parentBusinessRole = data.parentId
                ? await businessRolesApi.getBusinessRoleById({businessRoleId: data.parentId})
                : null;

            if (parentBusinessRole?.data) {
                handleParentBusinessRoleSelect(parentBusinessRole.data);
            }
        } catch (error) {
            console.error('Error fetching business role data:', error);
        }
    };

    useEffect(() => {
        if (initialValue) {
            fetchInitialValues(initialValue);
        }
    }, [initialValue]);

    const fetchParentBusinessRoleOptions = async () => {
        const response = await businessRolesApi.getAllBusinessRoles({
            search: searchParentBusinessRole ?? '',
            limit: 10,
        });
        setParentBusinessRoleOptions(response.data.data ?? []);
    };

    const handleOpenParentBusinessRoleModal = () => {
        fetchParentBusinessRoleOptions();
        setIsParentBusinessRoleModalOpen(true);
    };

    const handleCloseParentBusinessRoleModal = () => {
        setIsParentBusinessRoleModalOpen(false);
    };

    const renderParentBusinessRoleSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Родительская бизнес-роль
                </label>
                <TextInput
                    name="parentBusinessRole"
                    value={searchParentBusinessRole ?? selectedParentBusinessRoleId ?? ''}
                    onUpdate={handleParentBusinessRoleChange}
                    onBlur={formik.handleBlur('parentBusinessRole')}
                    error={
                        formik.touched.parentBusinessRole
                            ? formik.errors.parentBusinessRole
                            : undefined
                    }
                    placeholder="Введите и выберите родительскую бизнес-роль"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenParentBusinessRoleModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск бизнес-ролей
                </Button>
                <Modal
                    open={isParentBusinessRoleModalOpen}
                    onOpenChange={handleCloseParentBusinessRoleModal}
                >
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск бизнес-ролей</Text>
                        <Box marginTop="10px">
                            {parentBusinessRoleOptions.map((item) => (
                                <Card
                                    key={item.id}
                                    type="selection"
                                    onClick={() => handleParentBusinessRoleSelect(item)}
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
                        <Button view="normal" onClick={fetchParentBusinessRoleOptions}>
                            Обновить поиск
                        </Button>
                        <Button view="normal" onClick={handleCloseParentBusinessRoleModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <Text variant="header-1">
                {initialValue ? 'Редактирование бизнес-роли' : 'Создание новой бизнес-роли'}
            </Text>
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
                <InputField
                    label="Shop Name"
                    name="shopName"
                    value={formik.values.shopName}
                    onChange={(value) => formik.setFieldValue('shopName', value)}
                    onBlur={formik.handleBlur('shopName')}
                    error={formik.touched.shopName ? formik.errors.shopName : undefined}
                    placeholder="Введите shop name"
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
                {renderParentBusinessRoleSelector()}
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

export default BusinessRoleForm;
