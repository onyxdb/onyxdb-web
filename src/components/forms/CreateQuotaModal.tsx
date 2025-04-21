'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Select, SelectOption, Text, useToaster} from '@gravity-ui/uikit';
import {InputField} from '@/components/formik/InputField';
import {MDBQuotasApiUploadQuotasToProductsRequest, Resource} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {ProductSelector} from '@/components/ProductSelector';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface CreateQuotaModalProps {
    closeAction: () => void;
    submitAction: (quotaRequest: MDBQuotasApiUploadQuotasToProductsRequest) => void;
}

export const CreateQuotaModal: React.FC<CreateQuotaModalProps> = ({closeAction, submitAction}) => {
    const [resources, setResources] = useState<Resource[]>([]);
    // const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const toaster = useToaster();

    const formik = useFormik<MDBQuotasApiUploadQuotasToProductsRequest>({
        initialValues: {
            uploadQuotasToProductsRequest: {
                products: {
                    productId: '',
                    quotas: [
                        {
                            id: '',
                            resourceId: '',
                            limit: 0,
                        },
                    ],
                },
            },
        },
        validate: (values) => {
            const errors: Partial<MDBQuotasApiUploadQuotasToProductsRequest> = {};
            if (!values.uploadQuotasToProductsRequest.products.productId) {
                errors.uploadQuotasToProductsRequest = {
                    products: {
                        productId: 'ID продукта обязателен',
                    },
                };
            }
            values.uploadQuotasToProductsRequest.products.quotas.forEach((quota, index) => {
                if (!quota.resourceId) {
                    if (!errors.uploadQuotasToProductsRequest) {
                        errors.uploadQuotasToProductsRequest = {
                            products: {
                                quotas: [],
                            },
                        };
                    }
                    errors.uploadQuotasToProductsRequest.products.quotas[index] = {
                        resourceId: 'ID ресурса обязателен',
                    };
                }
                if (quota.limit <= 0) {
                    if (!errors.uploadQuotasToProductsRequest) {
                        errors.uploadQuotasToProductsRequest = {
                            products: {
                                quotas: [],
                            },
                        };
                    }
                    errors.uploadQuotasToProductsRequest.products.quotas[index] = {
                        limit: 'Лимит должен быть больше 0',
                    };
                }
            });
            return errors;
        },
        onSubmit: (values) => {
            submitAction(values);
            formik.resetForm();
        },
    });

    const fetchResources = async () => {
        try {
            const resourcesResponse = await mdbQuotasApi.listResources();
            setResources(resourcesResponse.data.resources);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    useEffect(() => {
        fetchResources();
    }, []);

    const handleAddQuota = () => {
        formik.setFieldValue('uploadQuotasToProductsRequest.products.quotas', [
            ...formik.values.uploadQuotasToProductsRequest.products.quotas,
            {resourceId: '', limit: 0},
        ]);
    };

    const handleRemoveQuota = (index: number) => {
        const updatedQuotas = formik.values.uploadQuotasToProductsRequest.products.quotas.filter(
            (_, i) => i !== index,
        );
        formik.setFieldValue('uploadQuotasToProductsRequest.products.quotas', updatedQuotas);
    };

    const handleQuotaChange = (index: number, field: string, value: string | number) => {
        const updatedQuotas = formik.values.uploadQuotasToProductsRequest.products.quotas.map(
            (quota, i) => {
                if (i === index) {
                    return {
                        ...quota,
                        [field]: value,
                    };
                }
                return quota;
            },
        );
        formik.setFieldValue('uploadQuotasToProductsRequest.products.quotas', updatedQuotas);
    };

    const resourceOptions: SelectOption[] = resources.map((resource) => (
        <Select.Option key={resource.id} value={resource.id}>
            {/*{resource.name} ({resource.units})*/} TODO
            {resource.name} (units)
        </Select.Option>
    ));

    const handleSubmit = async (values: MDBQuotasApiUploadQuotasToProductsRequest) => {
        try {
            await mdbQuotasApi.uploadQuotasToProducts(values);
            formik.resetForm();
            closeAction();
            toaster.add({
                name: 'Квоты успешно созданы',
                title: 'Квоты успешно созданы',
                content: 'Операция выполнена успешно.',
                theme: 'success',
            });
        } catch (error) {
            console.error('Error creating quotas:', error);
            toaster.add({
                name: 'Ошибка создания квот',
                title: 'Ошибка создания квот',
                content: 'Не удалось создать квоты.',
                theme: 'danger',
            });
        }
    };

    return (
        <Modal open={true} onOpenChange={closeAction}>
            <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                <Text variant="header-1">Создание квоты</Text>
                <form onSubmit={formik.handleSubmit} style={{marginTop: '20px'}}>
                    <ProductSelector
                        selectProductAction={(product) =>
                            formik.setFieldValue(
                                'uploadQuotasToProductsRequest.products.productId',
                                product.id,
                            )
                        }
                    />
                    <Box marginTop="20px">
                        <Text variant="header-2">Разрешения</Text>
                        {formik.values.uploadQuotasToProductsRequest.products.quotas.map(
                            (quota, index) => (
                                <Card key={index} style={{padding: '10px', marginBottom: '10px'}}>
                                    <Box marginBottom="10px">
                                        <Select
                                            size="m"
                                            placeholder="Выберите ресурс"
                                            value={[quota.resourceId]}
                                            onUpdate={(value: string[]) =>
                                                handleQuotaChange(index, 'resourceId', value[0])
                                            }
                                        >
                                            {resourceOptions}
                                        </Select>
                                        {formik.touched.uploadQuotasToProductsRequest?.products
                                            ?.quotas?.[index]?.resourceId &&
                                            formik.errors.uploadQuotasToProductsRequest?.products
                                                ?.quotas?.[index]?.resourceId && (
                                                <Text
                                                    variant="body-1"
                                                    color="danger"
                                                    style={{marginTop: '4px'}}
                                                >
                                                    {
                                                        formik.errors.uploadQuotasToProductsRequest
                                                            .products.quotas[index].resourceId
                                                    }
                                                </Text>
                                            )}
                                    </Box>
                                    <Box marginBottom="10px">
                                        <InputField
                                            label="Лимит"
                                            name={`uploadQuotasToProductsRequest.products.quotas[${index}].limit`}
                                            value={quota.limit.toString()}
                                            onChange={(value) =>
                                                handleQuotaChange(
                                                    index,
                                                    'limit',
                                                    parseInt(value, 10),
                                                )
                                            }
                                            onBlur={() => {}}
                                            error={
                                                formik.touched.uploadQuotasToProductsRequest
                                                    ?.products?.quotas?.[index]?.limit &&
                                                formik.errors.uploadQuotasToProductsRequest
                                                    ?.products?.quotas?.[index]?.limit && (
                                                    <Text
                                                        variant="body-1"
                                                        color="danger"
                                                        style={{marginTop: '4px'}}
                                                    >
                                                        {
                                                            formik.errors
                                                                .uploadQuotasToProductsRequest
                                                                .products.quotas[index].limit
                                                        }
                                                    </Text>
                                                )
                                            }
                                            placeholder="Введите лимит"
                                            type="number"
                                            // endContent={selectedResource?.units} TODO
                                        />
                                    </Box>
                                    <Button
                                        view="outlined"
                                        size="m"
                                        onClick={() => handleRemoveQuota(index)}
                                    >
                                        Удалить квоту
                                    </Button>
                                </Card>
                            ),
                        )}
                        <Button
                            view="normal"
                            size="m"
                            onClick={handleAddQuota}
                            style={{marginTop: '8px', marginBottom: '16px'}}
                        >
                            Добавить квоту
                        </Button>
                    </Box>
                    <HorizontalStack>
                        <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Создание...' : 'Создать квоту'}
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

export default CreateQuotaModal;
