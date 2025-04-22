'use client';
import React, {useState} from 'react';
import {Button, Progress, Select, Text, useToaster} from '@gravity-ui/uikit';
import {FormikErrors, useFormik} from 'formik';
import {
    ExchangeQuotasBetweenProductsRequest,
    Resource,
    SimulateQuotasExchangeBetweenProductsResponse,
} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ProductSelector} from '@/components/ProductSelector';
import {InputField} from '@/components/formik/InputField';
import {ProductDTOGet} from '@/generated/api';

interface TransferQuotaModalProps {
    product: ProductDTOGet;
    resources: Resource[];
    closeAction: () => void;
}

interface QuotaToTransfer {
    id: string;
    resourceId: string;
    limit: number;
}

export interface TransferQuotaFormFields {
    fromProductId: string;
    toProductId: string;
    quotas: QuotaToTransfer[];
}

export const TransferQuotaModal: React.FC<TransferQuotaModalProps> = ({
    product,
    resources,
    closeAction,
}) => {
    const toaster = useToaster();
    const [simulationResult, setSimulationResult] =
        useState<SimulateQuotasExchangeBetweenProductsResponse | null>(null);

    const formik = useFormik<TransferQuotaFormFields>({
        initialValues: {
            fromProductId: product.id,
            toProductId: '',
            quotas: [
                {
                    id: '',
                    resourceId: '',
                    limit: 0,
                },
            ],
        },
        validate: (values) => {
            const errors: Partial<FormikErrors<TransferQuotaFormFields>> = {};
            if (!values.fromProductId) {
                errors.fromProductId = 'ID продукта, который отдаёт квоты, обязателен';
            }
            if (!values.toProductId) {
                errors.toProductId = 'ID продукта, который принимает квоты, обязателен';
            }
            values.quotas.forEach((quota, index) => {
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
        onSubmit: async (values) => {
            const request: ExchangeQuotasBetweenProductsRequest = {
                fromProductId: values.fromProductId,
                toProductId: values.toProductId,
                quotas: values.quotas,
            };

            try {
                await mdbQuotasApi.exchangeQuotasBetweenProducts({
                    exchangeQuotasBetweenProductsRequest: request,
                });
                closeAction();
                toaster.add({
                    name: 'quotes_transferred',
                    title: 'Квоты успешно обменены',
                    content: 'Операция выполнена успешно.',
                    theme: 'success',
                });
            } catch (error) {
                console.error('Error exchanging quotas:', error);
                toaster.add({
                    name: 'error_quotes_transferred',
                    title: 'Ошибка обмена квот',
                    content: 'Консистентность изменилась, перевод не удался.',
                    theme: 'danger',
                });
            }
        },
    });

    const handleSimulateQuotasExchange = async () => {
        const request: ExchangeQuotasBetweenProductsRequest = {
            fromProductId: formik.values.fromProductId,
            toProductId: formik.values.toProductId,
            quotas: formik.values.quotas,
        };

        try {
            const simulationResponse = await mdbQuotasApi.simulateQuotasExchangeBetweenProducts({
                exchangeQuotasBetweenProductsRequest: request,
            });
            setSimulationResult(simulationResponse.data);
        } catch (error) {
            console.error('Error simulating quotas exchange:', error);
            setSimulationResult(null);
        }
    };

    const resourceOptions = resources.map((resource) => (
        <Select.Option key={resource.id} value={resource.id}>
            {/*{resource.displayName} ({resource.units}) TODO*/}
            {resource.displayName} (units)
        </Select.Option>
    ));

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <Text variant="header-1">Передача квот между продуктами</Text>
            <Box marginTop="20px">
                <HorizontalStack gap={20}>
                    <ProductSelector
                        initialValue={product}
                        selectProductAction={(productDTO) =>
                            formik.setFieldValue('fromProductId', productDTO.id)
                        }
                        label="Отдающий продукт"
                    />
                    <ProductSelector
                        selectProductAction={(productDTO) =>
                            formik.setFieldValue('toProductId', productDTO.id)
                        }
                        label="Принимающий продукт"
                    />
                </HorizontalStack>
            </Box>
            <Box marginTop="20px">
                <Text variant="subheader-2">Выбор ресурса и лимита</Text>
                <Box marginBottom="10px">
                    <Select
                        size="m"
                        placeholder="Выберите ресурс"
                        value={[
                            resources.find((p) => p.id === formik.values.quotas[0].resourceId)
                                ?.displayName ?? formik.values.quotas[0].resourceId,
                        ]}
                        onUpdate={(value) => formik.setFieldValue('quotas[0].resourceId', value[0])}
                    >
                        {resourceOptions}
                    </Select>
                    {formik.touched.quotas?.[0]?.resourceId &&
                    (formik.errors.quotas?.[0] as FormikErrors<QuotaToTransfer>)?.resourceId ? (
                        <div style={{color: 'red', marginTop: '4px'}}>
                            {
                                (formik.errors.quotas?.[0] as FormikErrors<QuotaToTransfer>)
                                    ?.resourceId
                            }
                        </div>
                    ) : null}
                </Box>
                <Box marginBottom="10px">
                    <InputField
                        label="Лимит"
                        name="quotas[0].limit"
                        value={formik.values.quotas[0].limit.toString()}
                        onChange={(value) =>
                            formik.setFieldValue('quotas[0].limit', parseInt(value, 10))
                        }
                        onBlur={formik.handleBlur('quotas[0].limit')}
                        error={
                            formik.touched.quotas?.[0]?.limit
                                ? (formik.errors.quotas?.[0] as FormikErrors<QuotaToTransfer>)
                                      ?.limit
                                : undefined
                        }
                        placeholder="Введите лимит"
                        type="number"
                        // endContent={
                        //     resources.find((r) => r.id === formik.values.quotas[0].resourceId)
                        //         ?.units
                        // }
                    />
                </Box>
                <Box marginBottom="20px">
                    <Button view="normal" size="m" onClick={handleSimulateQuotasExchange}>
                        Симулировать
                    </Button>
                </Box>
            </Box>
            {simulationResult && (
                <Box marginTop="20px">
                    <Text variant="subheader-2">Результат симуляции</Text>
                    <HorizontalStack gap={20}>
                        <Box>
                            <Text variant="subheader-1">Отдающий продукт</Text>
                            <Progress
                                stack={[
                                    // {
                                    //     theme: 'default',
                                    //     content: 'Использовано',
                                    //     value:
                                    //         (simulationResult.fromProduct.quotas[0].allocation /
                                    //             simulationResult.fromProduct.quotas[0].limit) *
                                    //         100,
                                    // },
                                    // {
                                    //     theme: 'success',
                                    //     content: 'Осталось',
                                    //     value:
                                    //         (simulationResult.fromProduct.quotas[0].free /
                                    //             simulationResult.fromProduct.quotas[0].limit) *
                                    //         100,
                                    // },
                                    {
                                        theme: 'danger',
                                        content: 'Отдаёт',
                                        value:
                                            (formik.values.quotas[0].limit /
                                                simulationResult.fromProduct.quotas[0].limit) *
                                            100,
                                    },
                                ]}
                            />
                        </Box>
                        <Box>
                            <Text variant="subheader-1">Принимающий продукт</Text>
                            <Progress
                                stack={[
                                    // {
                                    //     theme: 'default',
                                    //     content: 'Использовано',
                                    //     value:
                                    //         (simulationResult.toProduct.quotas[0].allocation /
                                    //             simulationResult.toProduct.quotas[0].limit) *
                                    //         100,
                                    // },
                                    // {
                                    //     theme: 'success',
                                    //     content: 'Осталось',
                                    //     value:
                                    //         (simulationResult.toProduct.quotas[0].free /
                                    //             simulationResult.toProduct.quotas[0].limit) *
                                    //         100,
                                    // },
                                    {
                                        theme: 'warning',
                                        content: 'Получает',
                                        value:
                                            (formik.values.quotas[0].limit /
                                                simulationResult.toProduct.quotas[0].limit) *
                                            100,
                                    },
                                ]}
                            />
                        </Box>
                    </HorizontalStack>
                </Box>
            )}
            <Box marginTop="20px">
                <HorizontalStack>
                    <Button
                        type="submit"
                        view="action"
                        size="l"
                        disabled={
                            !simulationResult ||
                            simulationResult.toProduct.quotas[0].limit < 0 ||
                            simulationResult.fromProduct.quotas[0].limit < 0 ||
                            formik.isSubmitting
                        }
                    >
                        {formik.isSubmitting ? 'Создание...' : 'Обменять квоты'}
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
            </Box>
        </div>
    );
};
