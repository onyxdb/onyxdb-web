'use client';

import React, {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {useFormik} from 'formik';
import {BusinessRoleDTO, RoleDTO} from '@/generated/api';
import {businessRolesApi} from '@/app/apis';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {Box} from '@/components/Layout/Box';
import RoleSelectionTable from '@/components/forms/RoleSelectionTable';

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
        parentBusinessRole: dto.parentId ? dto.name : '',
        parentBusinessRoleId: dto.parentId ?? '',
        selectedRoles: roles.map((role) => role.id ?? ''),
    };
}

export default function BusinessRoleEditPage() {
    const router = useRouter();
    const pathname = usePathname();
    const brId = pathname.split('/').pop() ?? '';

    const [businessRole, setBusinessRole] = useState<BusinessRoleDTO | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [parentBusinessRoleOptions, setParentBusinessRoleOptions] = useState<BusinessRoleDTO[]>(
        [],
    );

    const [searchParentBusinessRole, setSearchParentBusinessRole] = useState<string | null>(null);
    const [isParentBusinessRoleModalOpen, setIsParentBusinessRoleModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [roleOptions, setRoleOptions] = useState<RoleDTO[]>([]);

    useEffect(() => {
        const fetchBusinessRole = async () => {
            try {
                console.log('brId', brId);
                const response = await businessRolesApi.getBusinessRoleById({
                    businessRoleId: brId,
                });
                setBusinessRole(response.data);
                const rolesResponse = await businessRolesApi.getRolesByBusinessRoleId({
                    businessRoleId: brId as string,
                });
                setRoleOptions(rolesResponse.data ?? []);
                setSelectedRoles(rolesResponse.data.map((role) => role.id ?? ''));

                console.log('businessRole', businessRole);
            } catch (error) {
                console.error('Error fetching business role:', error);
            }
        };

        fetchBusinessRole();
    }, [brId]);

    const handleSaveRoles = () => {
        setIsConfirmationModalOpen(true);
    };

    const handleBusinessRoleEdit = async (values: BusinessRoleEditFormFields) => {
        try {
            await businessRolesApi.updateBusinessRole({
                businessRoleId: brId as string,
                businessRoleDTO: {
                    name: values.name,
                    shopName: values.shopName,
                    description: values.description,
                    parentId: values.parentBusinessRoleId,
                },
            });
            handleSaveRoles();
        } catch (error) {
            console.error('Failed to update business role:', error);
        }
    };

    const initialValues = businessRole
        ? mapDTOtoFormFields(businessRole, roleOptions)
        : {
              name: '',
              shopName: '',
              description: '',
              parentBusinessRole: '',
              parentBusinessRoleId: '',
              selectedRoles: [],
          };
    console.log('initialValues', initialValues);

    const formik = useFormik<BusinessRoleEditFormFields>({
        initialValues: initialValues,
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
        onSubmit: handleBusinessRoleEdit,
    });

    const handleParentBusinessRoleChange = (value: string) => {
        setSearchParentBusinessRole(value);
    };

    const handleParentBusinessRoleSelect = (businessRoleDTO: BusinessRoleDTO) => {
        setIsParentBusinessRoleModalOpen(false);
        formik.setFieldValue('parentBusinessRole', businessRoleDTO.name);
        formik.setFieldValue('parentBusinessRoleId', businessRoleDTO.id);
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

    const handleConfirmRoles = async () => {
        try {
            const currentRoles = await businessRolesApi.getRolesByBusinessRoleId({
                businessRoleId: brId as string,
            });

            const currentRoleIds = currentRoles.data.map((role) => role.id);
            const newRoleIds = formik.values.selectedRoles;

            const rolesToAdd = newRoleIds.filter((id) => !currentRoleIds.includes(id));
            const rolesToRemove = currentRoleIds.filter((id) => id && !newRoleIds.includes(id));

            for (const roleId of rolesToAdd) {
                await businessRolesApi.addRoleToBusinessRole({
                    businessRoleId: brId as string,
                    roleId: roleId,
                });
            }

            for (const roleId of rolesToRemove) {
                if (roleId) {
                    await businessRolesApi.removeRoleFromBusinessRole({
                        businessRoleId: brId as string,
                        roleId: roleId,
                    });
                }
            }

            setIsConfirmationModalOpen(false);
            router.push('/business-roles');
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
                                .filter((id) => !roleOptions.map((role) => role.id).includes(id))
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
                            {roleOptions
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
                                Ок
                            </Button>
                        </Box>
                    </HorizontalStack>
                </div>
            </Modal>
        );
    };

    const breadCrumps = [
        {href: '/', text: 'Главная'},
        {href: '/business-roles', text: 'Бизнес-роли'},
        {href: `/business-roles/edit/${brId}`, text: 'Редактирование бизнес-роли'},
    ];

    console.log('formik.values', formik.values);
    console.log('formik.values.name', formik.values.name);
    return (
        <div>
            <AppHeader breadCrumps={breadCrumps} actions={[]} />
            <div style={{padding: '20px'}}>
                <Box marginBottom="20px">
                    <Text variant="header-2">Редактирование бизнес-роли</Text>
                </Box>
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
                        selectedRoles={selectedRoles}
                        onSelectChange={formik.setFieldValue.bind(null, 'selectedRoles')}
                    />
                    <Box marginTop="20px">
                        <HorizontalStack>
                            <Button
                                view="normal"
                                size="l"
                                onClick={() => router.push('/business-roles')}
                            >
                                Назад
                            </Button>
                            <Box marginLeft="20px">
                                <Button
                                    view="outlined-success"
                                    size="l"
                                    onClick={handleSaveRoles}
                                    disabled={formik.isSubmitting}
                                >
                                    Сохранить роли
                                </Button>
                            </Box>
                            <Box marginLeft="20px">
                                <Button
                                    type="submit"
                                    view="action"
                                    size="l"
                                    disabled={formik.isSubmitting}
                                >
                                    {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
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
        </div>
    );
}
