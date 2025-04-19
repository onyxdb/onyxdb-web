'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Modal, Text} from '@gravity-ui/uikit';
import {V1CreateProjectRequest, V1ProjectResponse} from '@/generated/api-mdb';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {ProductSelector} from '@/components/ProductSelector';
import {ProductDTO} from '@/generated/api';
import {productsApi} from '@/app/apis';

interface ProjectFormProps {
    closeAction: () => void;
    submitAction: (project: V1CreateProjectRequest) => void;
    initialValue?: V1ProjectResponse;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    closeAction,
    submitAction,
    initialValue,
}) => {
    const [initialProduct, setInitialProduct] = useState<ProductDTO | null>(null);

    const formik = useFormik<V1CreateProjectRequest>({
        initialValues: {
            name: initialValue?.name || '',
            description: initialValue?.description || '',
            productId: initialValue?.productId || '',
        },
        validate: (values) => {
            const errors: Partial<V1CreateProjectRequest> = {};
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
            submitAction(values);
            formik.resetForm();
        },
    });

    const handleProductSelect = (product: ProductDTO) => {
        console.log('ProjectForm handleProductSelect', product);
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

    useEffect(() => {
        if (initialValue) {
            fetchProduct(initialValue.productId);
        }
    }, [initialValue]);

    return (
        <Modal open={true} onOpenChange={closeAction}>
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
                    {!initialValue && (
                        <ProductSelector
                            selectProductAction={handleProductSelect}
                            initialValue={initialProduct}
                            label="В каком продукте создать проект?"
                            header="Поиск продукта"
                        />
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
        </Modal>
    );
};
