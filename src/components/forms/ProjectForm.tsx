'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Select, Text} from '@gravity-ui/uikit';
import {CreateProjectRequestDTO, ProductDTO, ProjectDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {ProductSelector} from '@/components/formik/ProductSelector';
import {mdbApi, productsApi} from '@/app/apis';

interface ProjectFormProps {
    closeAction: () => void;
    submitAction: (project: CreateProjectRequestDTO) => void;
    initialValue?: ProjectDTO;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    closeAction,
    submitAction,
    initialValue,
}) => {
    const [initialProduct, setInitialProduct] = useState<ProductDTO | null>(null);
    const [namespaces, setNamespaces] = useState<string[]>([]);
    const isEditMode = initialValue !== undefined && initialValue !== null;

    const formik = useFormik<CreateProjectRequestDTO>({
        initialValues: {
            name: initialValue?.name || '',
            description: initialValue?.description || '',
            productId: initialValue?.productId || '',
            namespace: initialValue?.namespace || '',
        },
        validate: (values) => {
            const errors: Partial<CreateProjectRequestDTO> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            } else if (values.name.length > 100) {
                errors.name = 'Название не должно превышать 100 символов';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            } else if (values.description.length > 500) {
                errors.description = 'Описание не должно превышать 500 символов';
            }
            if (!values.productId) {
                errors.productId = 'ID продукта обязателен';
            }
            return errors;
        },
        onSubmit: (values) => {
            console.info('submitAction project');
            submitAction(values);
            formik.resetForm();
        },
    });

    const handleProductSelect = (product: ProductDTO) => {
        console.info('ProjectForm handleProductSelect', product);
        formik.setFieldValue('productId', product.id);
    };

    const fetchProduct = async (productId: string) => {
        try {
            const response = await productsApi.getProductById({productId: productId});
            setInitialProduct(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchNamespaces = async () => {
        try {
            const response = await mdbApi.listNamespaces();
            setNamespaces(response.data.namespaces);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    useEffect(() => {
        if (initialValue) {
            fetchProduct(initialValue.productId);
        }
        fetchNamespaces();
    }, [initialValue]);

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <Text variant="header-1">
                {initialValue ? 'Редактирование проекта' : 'Создание нового проекта'}
            </Text>
            <form onSubmit={formik.handleSubmit} style={{marginTop: '20px'}}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange('name')}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name ? formik.errors.name : undefined}
                    placeholder="Введите название проекта"
                    disabled={isEditMode}
                />
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange('description')}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание проекта"
                />
                {!isEditMode && (
                    <Box marginBottom="10px">
                        <ProductSelector
                            selectProductAction={handleProductSelect}
                            initialValue={initialProduct ?? undefined}
                            label="В каком продукте создать проект?"
                            header="Поиск продукта"
                        />
                        <label style={{display: 'block', marginBottom: '8px'}}>
                            Неймспейс проекта
                        </label>
                        <Select
                            size="m"
                            placeholder="Выберите неймспейс"
                            value={[formik.values.namespace]}
                            onUpdate={(value) => formik.setFieldValue('namespace', value[0])}
                            errorMessage={
                                formik.touched.namespace ? formik.errors.namespace : undefined
                            }
                        >
                            {namespaces.map((ns) => (
                                <Select.Option key={ns} value={ns}>
                                    {ns}
                                </Select.Option>
                            ))}
                        </Select>
                    </Box>
                )}
                <HorizontalStack>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Box marginLeft="20px">
                        <Button
                            view="normal"
                            size="l"
                            onClick={closeAction}
                            disabled={formik.isSubmitting}
                        >
                            Отмена
                        </Button>
                    </Box>
                </HorizontalStack>
            </form>
        </div>
    );
};
