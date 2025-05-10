'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {BusinessRoleDTO, RoleDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {businessRolesApi, rolesApi} from '@/app/apis';
import RoleSelectionTable from './RoleSelectionTable';

interface BusinessRoleEditFormProps {
    submitAction: (values: BusinessRoleEditFormFields) => void;
    closeAction: () => void;
    initialValue: BusinessRoleDTO;
}

export interface BusinessRoleEditFormFields {
    name: string;
    shopName: string;
    description: string;
    parentBusinessRole: string;
    parentBusinessRoleId: string;
    selectedRoles: string[];
}

function mapDTOtoFormFields(dto: BusinessRoleDTO, roles: RoleDTO[]): BusinessRoleEditFormFields {
    return {
        name: dto.name,
        shopName: dto.shopName,
        description: dto.description,
        parentBusinessRole: dto.parentId ?? '',
        parentBusinessRoleId: dto.parentId ?? '',
        selectedRoles: roles.map((role) => role.id ?? ''),
    };
}

export const BusinessRoleEditForm: React.FC<BusinessRoleEditFormProps> = ({
    submitAction,
    closeAction,
    initialValue,
}) => {
    const [parentBusinessRoleOptions, setParentBusinessRoleOptions] = useState<BusinessRoleDTO[]>(
        [],
    );
    const [searchParentBusinessRole, setSearchParentBusinessRole] = useState<string | null>(null);
    const [isParentBusinessRoleModalOpen, setIsParentBusinessRoleModalOpen] = useState(false);
    const [businessRoleRoles, setBusinessRoleRoles] = useState<RoleDTO[]>([]);
    const [roleOptions, setRoleOptions] = useState<RoleDTO[]>([]);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

    const formik = useFormik<BusinessRoleEditFormFields>({
        initialValues: mapDTOtoFormFields(initialValue, []),
        validate: (values) => {
            const errors: Partial<BusinessRoleEditFormFields> = {};
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

    useEffect(() => {
        const fetchRoleOptions = async () => {
            try {
                const response = await rolesApi.getAllRoles({
                    search: '',
                    limit: 100, // Без пагинации
                });
                setRoleOptions(response.data.data ?? []);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        const fetchRolesByBusinessRole = async () => {
            try {
                if (initialValue.id) {
                    const response = await businessRolesApi.getRolesByBusinessRoleId({
                        businessRoleId: initialValue.id,
                    });
                    setBusinessRoleRoles(response.data);
                    formik.setFieldValue(
                        'selectedRoles',
                        response.data.map((role) => role.id ?? ''),
                    );
                }
            } catch (error) {
                console.error('Error fetching roles by business role:', error);
            }
        };

        fetchRoleOptions();
        fetchRolesByBusinessRole();
    }, [initialValue]);

    const handleParentBusinessRoleChange = (value: string) => {
        setSearchParentBusinessRole(value);
    };

    const handleParentBusinessRoleSelect = (businessRole: BusinessRoleDTO) => {
        setIsParentBusinessRoleModalOpen(false);
        formik.setFieldValue('parentBusinessRole', businessRole.name);
        formik.setFieldValue('parentBusinessRoleId', businessRole.id);
    };

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

    const handleSaveRoles = () => {
        setIsConfirmationModalOpen(true);
    };

    const handleConfirmRoles = async () => {
        try {
            if (!initialValue.id) {
                return;
            }
            const currentRoles = await businessRolesApi.getRolesByBusinessRoleId({
                businessRoleId: initialValue.id,
            });

            const currentRoleIds = currentRoles.data.map((role) => role.id);
            const newRoleIds = formik.values.selectedRoles;

            const rolesToAdd = newRoleIds.filter((id) => !currentRoleIds.includes(id));
            const rolesToRemove = currentRoleIds.filter((id) => id && !newRoleIds.includes(id));

            for (const roleId of rolesToAdd) {
                await businessRolesApi.addRoleToBusinessRole({
                    businessRoleId: initialValue.id,
                    roleId: roleId,
                });
            }

            for (const roleId of rolesToRemove) {
                if (roleId) {
                    await businessRolesApi.removeRoleFromBusinessRole({
                        businessRoleId: initialValue.id,
                        roleId: roleId,
                    });
                }
            }

            setIsConfirmationModalOpen(false);
            submitAction(formik.values);
        } catch (error) {
            console.error('Error updating roles for business role:', error);
            setIsConfirmationModalOpen(false);
        }
    };

    const handleCancelRoles = () => {
        setIsConfirmationModalOpen(false);
    };

    const renderConfirmationModal = () => {
        return (
            <Modal open={isConfirmationModalOpen} onOpenChange={handleCancelRoles}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">Изменения в ролях</Text>
                    <Box marginTop="10px">
                        <Text variant="subheader-1">Роли, которые будут добавлены:</Text>
                        <ul>
                            {formik.values.selectedRoles
                                .filter(
                                    (id) => !businessRoleRoles.map((role) => role.id).includes(id),
                                )
                                .map((id) => (
                                    <li key={id}>
                                        <Text variant="subheader-1" color="secondary">
                                            {roleOptions.find((role) => role.id === id)?.name}
                                        </Text>
                                    </li>
                                ))}
                        </ul>
                        <Text variant="subheader-1">Роли, которые будут удалены:</Text>
                        <ul>
                            {businessRoleRoles
                                .filter(
                                    (role) => !formik.values.selectedRoles.includes(role.id ?? ''),
                                )
                                .map((role) => (
                                    <li key={role.id}>
                                        <Text variant="subheader-1" color="secondary">
                                            {role.name}
                                        </Text>
                                    </li>
                                ))}
                        </ul>
                    </Box>
                    <HorizontalStack>
                        <Button view="normal" size="l" onClick={handleCancelRoles}>
                            Назад
                        </Button>
                        <Box marginLeft="20px">
                            <Button view="outlined-success" size="l" onClick={handleConfirmRoles}>
                                Сохранить
                            </Button>
                        </Box>
                    </HorizontalStack>
                </div>
            </Modal>
        );
    };

    return (
        <div style={{padding: '20px'}}>
            <h1>Редактирование бизнес-роли: {initialValue.name}</h1>
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
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>
                        Родительская бизнес-роль
                    </label>
                    <TextInput
                        name="parentBusinessRole"
                        value={formik.values.parentBusinessRole}
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
                <RoleSelectionTable
                    selectedRoles={formik.values.selectedRoles}
                    onSelectChange={formik.setFieldValue.bind(null, 'selectedRoles')}
                />
                <Box marginTop="20px">
                    <HorizontalStack>
                        <Button view="normal" size="l" onClick={closeAction}>
                            Назад
                        </Button>
                        <Box marginLeft="20px">
                            <Button
                                view="outlined-success"
                                size="l"
                                onClick={handleSaveRoles}
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? 'Сохранить?' : 'Сохранить'}
                            </Button>
                        </Box>
                        <Box marginLeft="20px">
                            <Button
                                view="normal"
                                size="l"
                                disabled={formik.isSubmitting}
                                onClick={formik.handleReset}
                            >
                                Сбросить
                            </Button>
                        </Box>
                    </HorizontalStack>
                </Box>
            </form>
            {renderConfirmationModal()}
        </div>
    );
};

export default BusinessRoleEditForm;
