'use client';

import React, {useEffect, useState} from 'react';
import {FormikErrors, useFormik} from 'formik';
import {Button, Card, Select, Text} from '@gravity-ui/uikit';
import {InputField} from '@/components/formik/InputField';
import {Resource} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {ProductSelector} from '@/components/ProductSelector';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface CreateQuotaModalProps {
    productId?: string;
    closeAction: () => void;
    submitAction: (quotaRequest: CreateQuotaFormFields) => void;
}

interface CreateQuota {
    id: string;
    resourceId: string;
    limit: number;
}

export interface CreateQuotaFormFields {
    productId?: string;
    quotas: CreateQuota[];
}

export const CreateQuotaForm: React.FC<CreateQuotaModalProps> = ({
    productId,
    closeAction,
    submitAction,
}) => {
    const [resources, setResources] = useState<Resource[]>([]);

    const formik = useFormik<CreateQuotaFormFields>({
        initialValues: {
            productId: productId ?? '',
            quotas: [
                {
                    id: '',
                    resourceId: '',
                    limit: 0,
                },
            ],
        },
        validate: (values) => {
            const errors: Partial<FormikErrors<CreateQuotaFormFields>> = {};
            if (!values.productId) {
                errors.productId = 'ID продукта обязателен';
            }
            values.quotas.forEach((quota, index) => {
                console.log('quota', quota, !quota.resourceId || quota.limit <= 0);
                if (!quota.resourceId || quota.limit <= 0) {
                    if (!errors.quotas) {
                        errors.quotas = [];
                    }

                    const resourceIdError = quota.resourceId ? '' : 'ID ресурса обязателен';
                    const limitError = quota.limit > 0 ? '' : 'Лимит должен быть больше 0';
                    // @ts-ignore
                    errors.quotas[index] = {
                        resourceId: resourceIdError,
                        limit: limitError,
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
        formik.setFieldValue('quotas', [...formik.values.quotas, {resourceId: '', limit: 0}]);
    };

    const handleRemoveQuota = (index: number) => {
        const updatedQuotas = formik.values.quotas.filter((_, i) => i !== index);
        formik.setFieldValue('quotas', updatedQuotas);
    };

    const handleQuotaChange = (index: number, field: string, value: string | number) => {
        const updatedQuotas = formik.values.quotas.map((quota, i) => {
            if (i === index) {
                return {
                    ...quota,
                    [field]: value,
                };
            }
            return quota;
        });
        formik.setFieldValue('quotas', updatedQuotas);
    };

    const resourceOptions = resources.map((resource) => (
        <Select.Option key={resource.id} value={resource.id}>
            {resource.description} ({resource.unit})
        </Select.Option>
    ));

    return (
        <div>
            <Text variant="header-1">Загрузка квоты</Text>
            <form onSubmit={formik.handleSubmit} style={{marginTop: '20px'}}>
                {!productId && (
                    <ProductSelector
                        selectProductAction={(product) =>
                            formik.setFieldValue('productId', product.id)
                        }
                    />
                )}
                <Box marginTop="20px">
                    <Text variant="subheader-2">Разрешения</Text>
                    {formik.values.quotas.map((quota, index) => (
                        <Card key={index} style={{padding: '10px', marginBottom: '10px'}}>
                            <Box marginBottom="10px">
                                <Select
                                    size="m"
                                    placeholder="Выберите ресурс"
                                    value={[
                                        resources.find((p) => p.id === quota.resourceId)
                                            ?.description ?? quota.resourceId,
                                    ]}
                                    onUpdate={(value: string[]) =>
                                        handleQuotaChange(index, 'resourceId', value[0])
                                    }
                                >
                                    {resourceOptions}
                                </Select>
                                {formik.touched.quotas?.[index]?.resourceId &&
                                    (formik.errors?.quotas?.[index] as FormikErrors<CreateQuota>)
                                        ?.resourceId && (
                                        <Text
                                            variant="body-1"
                                            color="danger"
                                            style={{marginTop: '4px'}}
                                        >
                                            {
                                                (
                                                    formik.errors?.quotas?.[
                                                        index
                                                    ] as FormikErrors<CreateQuota>
                                                ).resourceId
                                            }
                                        </Text>
                                    )}
                            </Box>
                            <Box marginBottom="10px">
                                <InputField
                                    label="Лимит"
                                    name={`quotas[${index}].limit`}
                                    value={quota.limit.toString()}
                                    onChange={(value) =>
                                        handleQuotaChange(index, 'limit', parseInt(value, 10))
                                    }
                                    onBlur={() => {}}
                                    error={
                                        formik.touched?.quotas?.[index]?.limit
                                            ? (
                                                  formik.errors?.quotas?.[
                                                      index
                                                  ] as FormikErrors<CreateQuota>
                                              )?.limit
                                            : undefined
                                    }
                                    placeholder="Введите лимит"
                                    type="number"
                                    // endContent={selectedResource?.units}
                                />
                            </Box>
                            <Button
                                view="outlined-danger"
                                size="m"
                                onClick={() => handleRemoveQuota(index)}
                            >
                                Удалить квоту
                            </Button>
                        </Card>
                    ))}
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
    );
};

export default CreateQuotaForm;
