'use client';

import React, {useEffect, useState} from 'react';
import {Button, Progress, Select, Text, Tooltip} from '@gravity-ui/uikit';
import {FormikErrors, useFormik} from 'formik';
import {
    Resource,
    SimulateTransferQuotasBetweenProductsResponse,
    TransferQuotasBetweenProductsRequest,
} from '@/generated/api';
import {mdbQuotasApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ProductSelector} from '@/components/ProductSelector';
import {ProductDTO} from '@/generated/api';
import {ResourceInputField, ResourceUnit} from '@/components/ResourceInputField';
import {QuotaTransferSimulationResult} from '@/components/QuotaTransferSimulationResult';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

interface TransferQuotaModalProps {
    product: ProductDTO;
    resources: Resource[];
    closeAction: () => void;
}

interface QuotaToTransfer {
    id: string;
    resourceId: string;
    limit: number;
}

export interface TransferQuotaFormFields {
    srcProductId: string;
    dstProductId: string;
    quota: QuotaToTransfer;
    simulation: string;
}

export const TransferQuotaModal: React.FC<TransferQuotaModalProps> = ({
    product,
    resources,
    closeAction,
}) => {
    const [resourceUnit, setResourceUnit] = useState<ResourceUnit | null>(null);
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [simulationResult, setSimulationResult] =
        useState<SimulateTransferQuotasBetweenProductsResponse | null>(null);

    const formik = useFormik<TransferQuotaFormFields>({
        initialValues: {
            srcProductId: product.id,
            dstProductId: '',
            quota: {
                id: '',
                resourceId: '',
                limit: 0,
            },
            simulation: '',
        },
        validate: (values) => {
            const errors: Partial<FormikErrors<TransferQuotaFormFields>> = {};
            if (!values.srcProductId) {
                errors.srcProductId = 'ID продукта, который отдаёт квоты, обязателен';
            }
            if (!values.dstProductId) {
                errors.dstProductId = 'ID продукта, который принимает квоты, обязателен';
            }
            // console.log(
            //     'validate',
            //     values.quota.limit,
            //     !values.quota.resourceId || values.quota.limit <= 0,
            // );
            if (!values.quota.resourceId || values.quota.limit <= 0) {
                if (!errors.quota) {
                    errors.quota = {};
                }
                const resourceIdError = values.quota.resourceId ? '' : 'ID ресурса обязателен';
                const limitError = values.quota.limit > 0 ? '' : 'Лимит должен быть больше 0';
                errors.quota = {
                    resourceId: resourceIdError,
                    limit: limitError,
                };
            }

            if (
                simulationResult?.srcProduct.quotas[0].free === undefined ||
                simulationResult.srcProduct.quotas[0].free < 0
            ) {
                errors.simulation =
                    'Результат симуляции отрицательный: Не осталось свободных ресурсов ';
            }
            return errors;
        },
        onSubmit: async (values) => {
            const request: TransferQuotasBetweenProductsRequest = {
                srcProductId: values.srcProductId,
                dstProductId: values.dstProductId,
                quotas: [values.quota],
            };
            console.log('Transfer Quotas request', request, 'formik', formik.values);

            try {
                await mdbQuotasApi.transferQuotasBetweenProducts({
                    transferQuotasBetweenProductsRequest: request,
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

    const handleSimulateQuotasTransfer = async () => {
        console.log('Simulate Quotas request', formik.values);
        const request: TransferQuotasBetweenProductsRequest = {
            srcProductId: formik.values.srcProductId,
            dstProductId: formik.values.dstProductId,
            quotas: [formik.values.quota],
        };

        try {
            const simulationResponse = await mdbQuotasApi.simulateTransferQuotasBetweenProducts({
                transferQuotasBetweenProductsRequest: request,
            });
            console.log('Simulate Quotas response', simulationResponse.data);
            setSimulationResult(simulationResponse.data);
        } catch (error) {
            console.error('Error simulating quotas exchange:', error);
            setSimulationResult(null);
        }
    };

    useEffect(() => {
        if (isMonitoring) {
            const interval = setInterval(() => {
                handleSimulateQuotasTransfer();
                formik.validateForm();
            }, 1000);
            setMonitoringInterval(interval);
            return () => {
                clearInterval(interval);
                setMonitoringInterval(null);
            };
        }
        return () => {
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
                setMonitoringInterval(null);
            }
        };
    }, [isMonitoring, formik.values.quota.limit]);

    const resourceOptions = resources.map((resource) => (
        <Select.Option key={resource.id} value={resource.id}>
            {resource.description} ({resource.unit})
        </Select.Option>
    ));

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <Text variant="header-1">Передача квот между продуктами</Text>
            <form onSubmit={formik.handleSubmit}>
                <Box marginTop="20px">
                    <HorizontalStack gap={20}>
                        <ProductSelector
                            initialValue={product}
                            selectProductAction={(productDTO) =>
                                formik.setFieldValue('srcProductId', productDTO.id)
                            }
                            label="Отдающий продукт"
                        />
                        <ProductSelector
                            selectProductAction={(productDTO) =>
                                formik.setFieldValue('dstProductId', productDTO.id)
                            }
                            label="Принимающий продукт"
                        />
                    </HorizontalStack>
                </Box>
                <div>
                    <Text variant="body-1">Ресурс</Text>
                    <Box marginBottom="10px">
                        <Select
                            size="m"
                            placeholder="Выберите ресурс"
                            value={[
                                resources.find((p) => p.id === formik.values.quota.resourceId)
                                    ?.description ?? formik.values.quota.resourceId,
                            ]}
                            onUpdate={(value) => formik.setFieldValue('quota.resourceId', value[0])}
                            errorMessage={
                                formik.touched.quota?.resourceId
                                    ? formik.errors.quota?.resourceId
                                    : undefined
                            }
                        >
                            {resourceOptions}
                        </Select>
                    </Box>
                    <Text variant="body-1">Сколько передам</Text>
                    <Box marginBottom="10px" style={{maxWidth: '300px'}}>
                        <ResourceInputField
                            name="quota.limit"
                            value={formik.values.quota.limit}
                            changeAction={(value: number, unit: ResourceUnit) => {
                                formik.setFieldValue('quota.limit', value);
                                setResourceUnit(unit);
                            }}
                            onBlur={formik.handleBlur('quota.limit')}
                            error={
                                formik.touched.quota?.limit ? formik.errors.quota?.limit : undefined
                            }
                            placeholder="Введите лимит"
                            unitType={
                                resources.find((r) => r.id === formik.values.quota.resourceId)
                                    ?.unit ?? 'bytes'
                            }
                        />
                    </Box>
                    <Box marginBottom="20px">
                        <Button
                            view={isMonitoring ? 'outlined-success' : 'outlined-action'}
                            size="m"
                            onClick={() => setIsMonitoring(!isMonitoring)}
                            disabled={
                                !formik.values.dstProductId ||
                                !formik.values.srcProductId ||
                                !formik.values.quota.limit ||
                                !formik.values.quota.resourceId
                            }
                        >
                            Симулировать
                        </Button>
                    </Box>
                </div>
                {simulationResult && resourceUnit && (
                    <Box marginTop="20px">
                        <Tooltip
                            content={
                                <div>
                                    <Text>Пример отображения информации о загрузке по квотам</Text>
                                    <Progress
                                        stack={[
                                            {
                                                theme: 'info',
                                                content: `Используется`,
                                                value: 50,
                                            },
                                            {
                                                theme: 'misc',
                                                content: `Свободно`,
                                                value: 50,
                                            },
                                        ]}
                                    />
                                    <Progress
                                        stack={[
                                            {
                                                theme: 'warning',
                                                content: `Исп. опасно`,
                                                value: 85,
                                            },
                                            {
                                                theme: 'misc',
                                                content: `Свободно`,
                                                value: 15,
                                            },
                                        ]}
                                    />
                                </div>
                            }
                        >
                            <Text variant="subheader-1">Результат симуляции</Text>
                        </Tooltip>
                        <HorizontalStack justify="space-between" gap={20}>
                            <Box style={{flex: 1}}>
                                <QuotaTransferSimulationResult
                                    title="Отдающий продукт"
                                    quota={simulationResult.srcProduct.quotas[0]}
                                    transferAmount={formik.values.quota.limit || 0}
                                    unit={resourceUnit}
                                    isSource
                                />
                            </Box>
                            <Box style={{flex: 1}}>
                                <QuotaTransferSimulationResult
                                    title="Принимающий продукт"
                                    quota={simulationResult.dstProduct.quotas[0]}
                                    transferAmount={formik.values.quota.limit || 0}
                                    unit={resourceUnit}
                                />
                            </Box>
                        </HorizontalStack>
                    </Box>
                )}
                {formik.touched.simulation && formik.errors.simulation && (
                    <Text variant="body-1" color="danger" style={{marginTop: '4px'}}>
                        {formik.errors.simulation}
                    </Text>
                )}
                <Box marginTop="20px">
                    <HorizontalStack>
                        <Button
                            type="submit"
                            view="action"
                            size="l"
                            disabled={
                                !simulationResult ||
                                simulationResult.dstProduct.quotas[0].limit < 0 ||
                                simulationResult.srcProduct.quotas[0].limit < 0 ||
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
            </form>
        </div>
    );
};
