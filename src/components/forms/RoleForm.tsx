'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Checkbox, Modal, Select, Text, TextInput} from '@gravity-ui/uikit';
import {OrganizationUnitDTO, PermissionDTO, ProductDTO, RoleDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {organizationUnitsApi, productsApi, rolesApi} from '@/app/apis';
import PermissionForm, {PermissionFormFields} from './PermissionForm';

interface RoleFormProps {
    onSubmit: (values: RoleFormFields) => void;
    onClose: () => void;
    initialValue?: RoleDTO;
}

export interface RoleFormFields {
    roleType: string;
    name: string;
    shopName: string;
    isShopHidden: boolean;
    description: string;
    productId?: string;
    orgUnitId?: string;
    permissions: PermissionFormFields[];
}

export function mapPermissionFormToDTO(formFields: PermissionFormFields): PermissionDTO {
    const transformedData: {[key: string]: object} = {};

    for (const key in formFields.data) {
        if (Object.prototype.hasOwnProperty.call(formFields.data, key)) {
            try {
                transformedData[key] = JSON.parse(formFields.data[key]);
            } catch (error) {
                console.error(`Error parsing data for key "${key}":`, error);
                // Если не удается преобразовать строку в объект, можно оставить значение как есть
                // или установить его в null, undefined или другой объект по умолчанию
                transformedData[key] = {};
            }
        }
    }

    return {
        id: formFields.id,
        actionType: formFields.actionType,
        resourceType: formFields.resourceType,
        data: transformedData,
    };
}

export function mapPermissionDTOtoFormFields(dto: PermissionDTO): PermissionFormFields {
    const transformedData: {[key: string]: string} = {};

    if (dto.data) {
        for (const key in dto.data) {
            if (Object.prototype.hasOwnProperty.call(dto.data, key)) {
                transformedData[key] = JSON.stringify(dto.data[key]);
            }
        }
    }

    return {
        id: dto.id,
        actionType: dto.actionType,
        resourceType: dto.resourceType,
        data: transformedData,
        deleted: false,
    };
}

export function mapDTOtoFormFields(dto: RoleDTO, permissions: PermissionDTO[]): RoleFormFields {
    return {
        roleType: dto.roleType,
        name: dto.name,
        shopName: dto.shopName,
        isShopHidden: dto.isShopHidden,
        description: dto.description,
        productId: dto.productId,
        orgUnitId: dto.orgUnitId,
        permissions: permissions.map((p) => mapPermissionDTOtoFormFields(p)),
    };
}

export const RoleForm: React.FC<RoleFormProps> = ({onSubmit, onClose, initialValue}) => {
    const [productOptions, setProductOptions] = useState<ProductDTO[]>([]);
    const [searchProduct, setSearchProduct] = useState<string | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);

    const [orgUnitOptions, setOrgUnitOptions] = useState<OrganizationUnitDTO[]>([]);
    const [searchOrgUnit, setSearchOrgUnit] = useState<string | null>(null);
    const [isOrgUnitModalOpen, setIsOrgUnitModalOpen] = useState(false);

    const [permissions, setPermissions] = useState<PermissionDTO[]>([]);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<PermissionFormFields | null>(null);

    const formik = useFormik<RoleFormFields>({
        initialValues: initialValue
            ? mapDTOtoFormFields(initialValue, permissions)
            : {
                  roleType: 'GLOBAL',
                  name: '',
                  shopName: '',
                  isShopHidden: false,
                  description: '',
                  productId: undefined,
                  orgUnitId: undefined,
                  permissions: [],
              },
        validate: (values) => {
            const errors: Partial<RoleFormFields> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            if (values.roleType === 'PRODUCT' && !values.productId) {
                errors.productId = 'Продукт обязателен';
            }
            if (values.roleType === 'ORG_UNIT' && !values.orgUnitId) {
                errors.orgUnitId = 'Организационная единица обязательна';
            }
            return errors;
        },
        onSubmit,
    });

    useEffect(() => {
        const fetchPermissions = async () => {
            if (initialValue?.id) {
                try {
                    const response = await rolesApi.getPermissionsByRoleId({
                        roleId: initialValue.id,
                    });
                    setPermissions(response.data.permissions ?? []);
                    formik.setFieldValue('permissions', response.data.permissions ?? []);
                } catch (error) {
                    console.error('Error fetching permissions:', error);
                }
            }
        };

        fetchPermissions();
    }, [initialValue]);

    const handleProductChange = (value: string) => {
        if (value.length === 0) {
            formik.setFieldValue('productId', null);
        }
        setSearchProduct(value);
    };

    const handleProductSelect = (product: ProductDTO) => {
        setIsProductModalOpen(false);
        setSearchProduct(product.name);
        formik.setFieldValue('productId', product.id);
        formik.setFieldValue('orgUnitId', undefined);
        formik.setFieldValue('roleType', 'PRODUCT');
    };

    const fetchProductOptions = async () => {
        const response = await productsApi.getAllProducts({
            search: searchProduct ?? '',
            limit: 10,
        });
        setProductOptions(response.data.data ?? []);
    };

    const handleOpenProductModal = () => {
        fetchProductOptions();
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
    };

    const handleOrgUnitChange = (value: string) => {
        if (value.length === 0) {
            formik.setFieldValue('orgUnitId', null);
        }
        setSearchOrgUnit(value);
    };

    const handleOrgUnitSelect = (orgUnit: OrganizationUnitDTO) => {
        setIsOrgUnitModalOpen(false);
        setSearchOrgUnit(orgUnit.name);
        formik.setFieldValue('orgUnitId', orgUnit.id);
        formik.setFieldValue('productId', undefined);
        formik.setFieldValue('roleType', 'ORG_UNIT');
    };

    const fetchOrgUnitOptions = async () => {
        const response = await organizationUnitsApi.getAllOrganizationUnits({
            search: searchOrgUnit ?? '',
            limit: 10,
        });
        setOrgUnitOptions(response.data.data ?? []);
    };

    const handleOpenOrgUnitModal = () => {
        fetchOrgUnitOptions();
        setIsOrgUnitModalOpen(true);
    };

    const handleCloseOrgUnitModal = () => {
        setIsOrgUnitModalOpen(false);
    };

    const handleRoleTypeChange = (value: string[]) => {
        formik.setFieldValue('roleType', value[0]);
        if (value[0] === 'GLOBAL') {
            formik.setFieldValue('productId', undefined);
            formik.setFieldValue('orgUnitId', undefined);
        }
    };

    const handlePermissionAdd = () => {
        setSelectedPermission(null);
        setIsPermissionModalOpen(true);
    };

    const handlePermissionEdit = (permission: PermissionFormFields) => {
        setSelectedPermission(permission);
        setIsPermissionModalOpen(true);
    };

    const handlePermissionModalClose = () => {
        setIsPermissionModalOpen(false);
    };

    const handlePermissionSubmit = (permission: PermissionFormFields) => {
        if (selectedPermission) {
            // Редактирование существующего разрешения
            const updatedPermissions = formik.values.permissions.map((p) =>
                p.id === selectedPermission.id ? permission : p,
            );
            formik.setFieldValue('permissions', updatedPermissions);
        } else {
            // Добавление нового разрешения
            formik.setFieldValue('permissions', [...formik.values.permissions, permission]);
        }
        handlePermissionModalClose();
    };

    const handlePermissionDelete = (permissionId: string) => {
        const updatedPermissions = formik.values.permissions.filter((p) => p.id !== permissionId);
        formik.setFieldValue('permissions', updatedPermissions);
    };

    const renderProductSelector = () => {
        return (
            <div style={{marginBottom: '20px', marginTop: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Продукт</label>
                <TextInput
                    name="product"
                    value={searchProduct ?? formik.values.productId ?? ''}
                    onUpdate={handleProductChange}
                    onBlur={formik.handleBlur('productId')}
                    error={formik.touched.productId ? formik.errors.productId : undefined}
                    placeholder="Введите и выберите продукт"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenProductModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск продуктов
                </Button>
                <Modal open={isProductModalOpen} onOpenChange={handleCloseProductModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск продуктов</Text>
                        <Box marginTop="10px">
                            {productOptions.map((item) => (
                                <Card
                                    key={item.id}
                                    type="selection"
                                    onClick={() => handleProductSelect(item)}
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
                        <Button view="normal" onClick={fetchProductOptions}>
                            Обновить поиск
                        </Button>
                        <Button view="normal" onClick={handleCloseProductModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    };

    const renderOrgUnitSelector = () => {
        return (
            <div style={{marginBottom: '20px', marginTop: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Организационная единица
                </label>
                <TextInput
                    name="orgUnit"
                    value={searchOrgUnit ?? formik.values.orgUnitId ?? ''}
                    onUpdate={handleOrgUnitChange}
                    onBlur={formik.handleBlur('orgUnitId')}
                    error={formik.touched.orgUnitId ? formik.errors.orgUnitId : undefined}
                    placeholder="Введите и выберите организационную единицу"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenOrgUnitModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск организационных единиц
                </Button>
                <Modal open={isOrgUnitModalOpen} onOpenChange={handleCloseOrgUnitModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск организационных единиц</Text>
                        <Box marginTop="10px">
                            {orgUnitOptions.map((item) => (
                                <Card
                                    key={item.id}
                                    type="selection"
                                    onClick={() => handleOrgUnitSelect(item)}
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
                        <Button view="normal" onClick={fetchOrgUnitOptions}>
                            Обновить поиск
                        </Button>
                        <Button view="normal" onClick={handleCloseOrgUnitModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            </div>
        );
    };

    const renderPermissions = () => {
        const [originalPermissions, setOriginalPermissions] = useState<PermissionDTO[]>([]);

        useEffect(() => {
            if (initialValue?.id) {
                const fetchOriginalPermissions = async () => {
                    try {
                        if (initialValue.id) {
                            const response = await rolesApi.getPermissionsByRoleId({
                                roleId: initialValue.id,
                            });
                            setOriginalPermissions(response.data.permissions ?? []);
                        }
                    } catch (error) {
                        console.error('Error fetching original permissions:', error);
                    }
                };

                fetchOriginalPermissions();
            }
        }, [initialValue]);

        const getCardTheme = (permission: PermissionFormFields) => {
            if (!initialValue?.id) {
                return 'normal';
            }
            const originalPermission = originalPermissions.find((p) => p.id === permission.id);
            if (!originalPermission) {
                return 'success';
            }
            if (
                originalPermission.actionType !== permission.actionType ||
                originalPermission.resourceType !== permission.resourceType ||
                JSON.stringify(originalPermission.data) !== JSON.stringify(permission.data)
            ) {
                return 'info';
            }
            const deletedPermission = formik.values.permissions.find(
                (p) => p.id === permission.id && p.deleted,
            );
            if (deletedPermission) {
                return 'danger';
            }
            return 'normal';
        };

        return (
            <div style={{marginBottom: '20px', marginTop: '20px'}}>
                <Text variant="header-2">Разрешения</Text>
                <Box marginTop="10px">
                    <Button
                        view="normal"
                        size="m"
                        onClick={handlePermissionAdd}
                        style={{marginBottom: '10px'}}
                    >
                        Добавить разрешение
                    </Button>
                </Box>
                <div>
                    {formik.values.permissions.map((permission) => (
                        <Card
                            key={permission.id}
                            type="selection"
                            style={{marginBottom: '10px', padding: '16px'}}
                            theme={getCardTheme(permission)}
                            size="l"
                        >
                            <Text variant="header-1">{permission.actionType}</Text>
                            <Box>
                                <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                    {permission.resourceType}
                                </Text>
                            </Box>
                            <Box>
                                <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                    {JSON.stringify(permission.data)}
                                </Text>
                            </Box>
                            <Box marginTop="10px">
                                <HorizontalStack>
                                    <Button
                                        view="normal"
                                        size="m"
                                        onClick={() => handlePermissionEdit(permission)}
                                    >
                                        Редактировать
                                    </Button>
                                    <Button
                                        view="normal"
                                        size="m"
                                        onClick={() => handlePermissionDelete(permission.id ?? '')}
                                        disabled={permission.deleted}
                                    >
                                        Удалить
                                    </Button>
                                </HorizontalStack>
                            </Box>
                        </Card>
                    ))}
                </div>
                <Modal open={isPermissionModalOpen} onOpenChange={handlePermissionModalClose}>
                    <div>
                        {selectedPermission && (
                            <PermissionForm
                                onSubmit={handlePermissionSubmit}
                                onClose={handlePermissionModalClose}
                                initialValue={selectedPermission}
                            />
                        )}
                        {!selectedPermission && (
                            <PermissionForm
                                onSubmit={handlePermissionSubmit}
                                onClose={handlePermissionModalClose}
                                initialValue={undefined}
                            />
                        )}
                    </div>
                </Modal>
            </div>
        );
    };

    const roleTypeOptions = [
        {value: 'GLOBAL', content: 'Глобальная'},
        {value: 'PRODUCT', content: 'Для продукта'},
        {value: 'ORG_UNIT', content: 'Для организации'},
    ];

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>{initialValue ? 'Редактирование роли' : 'Создание новой роли'}</h1>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name}
                    onChange={(value) => formik.setFieldValue('name', value)}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name ? formik.errors.name : undefined}
                    placeholder="Введите название"
                    note="Название роли должно быть уникальным"
                />
                <InputField
                    label="Магазинное название роли"
                    name="shopName"
                    value={formik.values.shopName}
                    onChange={(value) => formik.setFieldValue('shopName', value)}
                    onBlur={formik.handleBlur('shopName')}
                    error={formik.touched.shopName ? formik.errors.shopName : undefined}
                    placeholder="Введите shop name"
                    note="Название роли для отображения в магазине"
                />
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                    note="Краткое описание роли"
                />
                <HorizontalStack align="center">
                    <Select
                        value={[formik.values.roleType]}
                        onUpdate={handleRoleTypeChange}
                        placeholder="Выберите тип роли"
                    >
                        {roleTypeOptions.map((option) => (
                            <Select.Option key={option.value} value={option.value}>
                                {option.content}
                            </Select.Option>
                        ))}
                    </Select>
                    <Box marginLeft="20px">
                        <Checkbox
                            size="l"
                            checked={formik.values.isShopHidden}
                            onUpdate={(value) => formik.setFieldValue('isShopHidden', value)}
                        >
                            Скрывать роль в магазине?
                        </Checkbox>
                    </Box>
                    {/*<InputField*/}
                    {/*    label="Is Shop Hidden"*/}
                    {/*    name="isShopHidden"*/}
                    {/*    value={formik.values.isShopHidden.toString()}*/}
                    {/*    onChange={(value) => formik.setFieldValue('isShopHidden', value === 'true')}*/}
                    {/*    onBlur={formik.handleBlur('isShopHidden')}*/}
                    {/*    error={formik.touched.isShopHidden ? formik.errors.isShopHidden : undefined}*/}
                    {/*    placeholder="true или false"*/}
                    {/*    note="Определяет, скрыта ли роль для магазина"*/}
                    {/*/>*/}
                </HorizontalStack>
                {formik.values.roleType === 'PRODUCT' && renderProductSelector()}
                {formik.values.roleType === 'ORG_UNIT' && renderOrgUnitSelector()}
                {renderPermissions()}
                <Box marginTop="20px">
                    <HorizontalStack>
                        <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Box marginLeft="20px">
                            <Button
                                view="normal"
                                size="l"
                                disabled={formik.isSubmitting}
                                onClick={onClose}
                            >
                                Отменить
                            </Button>
                        </Box>
                    </HorizontalStack>
                </Box>
            </form>
        </div>
    );
};

export default RoleForm;
