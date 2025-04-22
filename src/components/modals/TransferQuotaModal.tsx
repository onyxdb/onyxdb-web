'use client';

import React, {useEffect, useState} from 'react';
import {Button, Progress, Select, Text, Tooltip, useToaster} from '@gravity-ui/uikit';
import {FormikErrors, useFormik} from 'formik';
import {
    Resource,
    SimulateTransferQuotasBetweenProductsResponse,
    TransferQuotasBetweenProductsRequest,
} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {ProductSelector} from '@/components/ProductSelector';
import {ProductDTOGet} from '@/generated/api';
import {ResourceInputField} from '@/components/ResourceInputField';

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
    srcProductId: string;
    dstProductId: string;
    quotas: QuotaToTransfer[];
    simulation: string;
}

function getColorDWI(isDanger: boolean, isWarning: boolean) {
    // eslint-disable-next-line no-nested-ternary
    return isDanger ? 'danger' : isWarning ? 'warning' : 'info';
}

function getColorDWS(isDanger: boolean, isWarning: boolean) {
    // eslint-disable-next-line no-nested-ternary
    return isDanger ? 'danger' : isWarning ? 'warning' : 'success';
}

function getColorDWP(isDanger: boolean, isWarning: boolean) {
    // eslint-disable-next-line no-nested-ternary
    return isDanger ? 'danger' : isWarning ? 'warning' : 'positive';
}

function roundTo(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
}

export const TransferQuotaModal: React.FC<TransferQuotaModalProps> = ({
    product,
    resources,
    closeAction,
}) => {
    const toaster = useToaster();
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [simulationResult, setSimulationResult] =
        useState<SimulateTransferQuotasBetweenProductsResponse | null>(null);

    const formik = useFormik<TransferQuotaFormFields>({
        initialValues: {
            srcProductId: product.id,
            dstProductId: '',
            quotas: [
                {
                    id: '',
                    resourceId: '',
                    limit: 0,
                },
            ],
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
                quotas: values.quotas,
            };

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

    const handleSimulateQuotasExchange = async () => {
        console.log('Simulate Quotas request', formik.values);
        const request: TransferQuotasBetweenProductsRequest = {
            srcProductId: formik.values.srcProductId,
            dstProductId: formik.values.dstProductId,
            quotas: formik.values.quotas,
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
            const interval = setInterval(() => handleSimulateQuotasExchange(), 1000);
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
    }, [isMonitoring, formik.values.quotas[0]?.limit]);

    const resourceOptions = resources.map((resource) => (
        <Select.Option key={resource.id} value={resource.id}>
            {resource.description} ({resource.unit})
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
                            resources.find((p) => p.id === formik.values.quotas[0].resourceId)
                                ?.description ?? formik.values.quotas[0].resourceId,
                        ]}
                        onUpdate={(value) => formik.setFieldValue('quotas[0].resourceId', value[0])}
                        errorMessage={
                            formik.touched.quotas?.[0]?.resourceId &&
                            (formik.errors.quotas?.[0] as FormikErrors<QuotaToTransfer>)?.resourceId
                        }
                    >
                        {resourceOptions}
                    </Select>
                </Box>
                <Text variant="body-1">Сколько передам</Text>
                <Box marginBottom="10px" style={{maxWidth: '300px'}}>
                    <ResourceInputField
                        name="quotas[0].limit"
                        value={formik.values.quotas[0].limit}
                        changeAction={(value: number) => {
                            formik.setFieldValue('quotas[0].limit', value);
                        }}
                        onBlur={formik.handleBlur('quotas[0].limit')}
                        error={
                            formik.touched.quotas?.[0]?.limit
                                ? (formik.errors.quotas?.[0] as FormikErrors<QuotaToTransfer>)
                                      ?.limit
                                : undefined
                        }
                        placeholder="Введите лимит"
                        unitType={
                            resources.find((r) => r.id === formik.values.quotas[0].resourceId)
                                ?.unit ?? 'bytes'
                        }
                    />
                </Box>
                <Box marginBottom="20px">
                    <Button
                        view={isMonitoring ? 'outlined-success' : 'outlined-action'}
                        size="m"
                        onClick={() => setIsMonitoring(!isMonitoring)}
                    >
                        Симулировать
                    </Button>
                </Box>
            </div>
            {simulationResult && (
                <Box marginTop="20px">
                    <Tooltip
                        content={
                            <Progress
                                stack={[
                                    {
                                        theme: 'info',
                                        content: `Used`,
                                        value: 30,
                                    },
                                    {
                                        theme: 'success',
                                        content: `Free`,
                                        value: 30,
                                    },
                                    {
                                        theme: 'danger',
                                        content: `Transferred`,
                                        value: 40,
                                    },
                                ]}
                            />
                        }
                    >
                        <Text variant="subheader-1">Результат симуляции</Text>
                    </Tooltip>
                    <HorizontalStack justify="space-between" gap={20}>
                        <Box style={{flex: 1}}>
                            <Text variant="body-1" color="secondary">
                                Отдающий продукт
                            </Text>

                            {(() => {
                                const srcQuota = simulationResult.srcProduct.quotas[0];
                                const transferAmount = formik.values.quotas[0].limit;
                                // const transferPercent =
                                //     roundTo(transferAmount / srcQuota.limit, 2) * 100;

                                const currentLimit = srcQuota.limit + transferAmount;
                                const currentUsage = srcQuota.usage;
                                const currentUsagePercent = roundTo(
                                    (currentUsage / currentLimit) * 100,
                                    2,
                                );
                                const currentFree = srcQuota.free + transferAmount;
                                const currentFreePercent = roundTo(
                                    (currentFree / currentLimit) * 100,
                                    2,
                                );

                                const willBeLimit = srcQuota.limit;
                                const willBeFree = srcQuota.free;
                                const willBeUsagePercent = roundTo(
                                    (currentUsage / willBeLimit) * 100,
                                    2,
                                );
                                const willBeFreePercent = roundTo(
                                    (willBeFree / willBeLimit) * 100,
                                    2,
                                );

                                // const willBeUsagePercentOrigin =
                                //     roundTo(currentUsage / currentLimit, 2) * 100;
                                // const willBeFreePercentOrigin =
                                //     roundTo(willBeFree / currentLimit, 2) * 100;

                                const isDangerCur = currentFree < 0;
                                const isWarningCur = currentFreePercent <= 25;

                                const isDangerNew = willBeFree < 0;
                                const isWarningNew = willBeFreePercent <= 25;

                                return (
                                    <>
                                        <Box
                                            marginTop="8px"
                                            style={{display: 'flex', flexDirection: 'column'}}
                                        >
                                            <Text variant="body-1">
                                                Потребление: {currentUsage}&nbsp;
                                                {srcQuota.resource.unit}
                                            </Text>
                                            <Text variant="body-1">
                                                Лимит: {currentLimit}&nbsp;--&gt;&nbsp;
                                                {willBeLimit}&nbsp;
                                                {srcQuota.resource.unit}
                                            </Text>
                                            <Text variant="body-1">
                                                Остаток: {currentFree}&nbsp;--&gt;&nbsp;
                                                {willBeFree}&nbsp;
                                                {srcQuota.resource.unit}
                                            </Text>
                                        </Box>
                                        <Text variant="body-1" color="secondary">
                                            Сейчас в отдающем продукте
                                        </Text>
                                        <Progress
                                            stack={[
                                                {
                                                    theme: getColorDWI(isDangerCur, isWarningCur),
                                                    content: (
                                                        <Tooltip content="Использовано">
                                                            <Text>{currentUsagePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.min(currentUsagePercent, 100),
                                                },
                                                {
                                                    theme: 'misc',
                                                    content: currentUsagePercent < 100 && (
                                                        <Tooltip content="Осталось">
                                                            <Text>{currentFreePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.min(currentFreePercent, 100),
                                                },
                                            ]}
                                        />
                                        <Text variant="body-1" color="secondary">
                                            Станет в отдающем продукте
                                        </Text>
                                        <Progress
                                            stack={[
                                                {
                                                    theme: getColorDWI(isDangerNew, isWarningNew),
                                                    content: (
                                                        <Tooltip content="Использовано">
                                                            <Text>{willBeUsagePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.max(willBeUsagePercent, 100),
                                                },
                                                {
                                                    theme: 'misc',
                                                    content: willBeUsagePercent < 100 && (
                                                        <Tooltip content="Осталось">
                                                            <Text>{willBeFreePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: willBeFreePercent,
                                                },
                                            ]}
                                        />
                                    </>
                                );
                            })()}
                        </Box>

                        <Box style={{flex: 1}}>
                            <Text variant="body-1" color="secondary">
                                Принимающий продукт
                            </Text>

                            {(() => {
                                const dstQuota = simulationResult.dstProduct.quotas[0];
                                const transferAmount = formik.values.quotas[0].limit;
                                // const transferPercent =
                                //     roundTo(transferAmount / dstQuota.limit, 2) * 100;

                                const currentLimit = dstQuota.limit + transferAmount;
                                const currentUsage = dstQuota.usage;
                                const currentUsagePercent = roundTo(
                                    (currentUsage / currentLimit) * 100,
                                    2,
                                );
                                const currentFree = dstQuota.free + transferAmount;
                                const currentFreePercent = roundTo(
                                    (currentFree / currentLimit) * 100,
                                    2,
                                );

                                const willBeLimit = dstQuota.limit;
                                const willBeFree = dstQuota.free;
                                const willBeUsagePercent = roundTo(
                                    (currentUsage / willBeLimit) * 100,
                                    2,
                                );
                                const willBeFreePercent = roundTo(
                                    (willBeFree / willBeLimit) * 100,
                                    2,
                                );

                                // const willBeUsagePercentOrigin =
                                //     roundTo(currentUsage / currentLimit, 2) * 100;
                                // const willBeFreePercentOrigin =
                                //     roundTo(willBeFree / currentLimit, 2) * 100;

                                const isDangerCur = currentFree < 0;
                                const isWarningCur = currentFreePercent <= 25;

                                const isDangerNew = willBeFree < 0;
                                const isWarningNew = willBeFreePercent <= 25;

                                return (
                                    <>
                                        <Box
                                            marginTop="8px"
                                            style={{display: 'flex', flexDirection: 'column'}}
                                        >
                                            <Text variant="body-1">
                                                Потребление: {currentUsage}&nbsp;
                                                {dstQuota.resource.unit}
                                            </Text>
                                            <Text variant="body-1">
                                                Лимит: {currentLimit}&nbsp;--&gt;&nbsp;
                                                {willBeLimit}&nbsp;
                                                {dstQuota.resource.unit}
                                            </Text>
                                            <Text variant="body-1">
                                                Остаток: {currentFree}&nbsp;--&gt;&nbsp;
                                                {willBeFree}&nbsp;
                                                {dstQuota.resource.unit}
                                            </Text>
                                        </Box>
                                        <Text variant="body-1" color="secondary">
                                            Сейчас в принимающем продукте
                                        </Text>
                                        <Progress
                                            stack={[
                                                {
                                                    theme: getColorDWI(isDangerCur, isWarningCur),
                                                    content: (
                                                        <Tooltip content="Использовано">
                                                            <Text>{currentUsagePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.min(currentUsagePercent, 100),
                                                },
                                                {
                                                    theme: 'default',
                                                    content: currentUsagePercent < 100 && (
                                                        <Tooltip content="Осталось">
                                                            <Text>{currentFreePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.min(currentFreePercent, 100),
                                                },
                                            ]}
                                        />
                                        <Text variant="body-1" color="secondary">
                                            Станет в принимающем продукте
                                        </Text>
                                        <Progress
                                            stack={[
                                                {
                                                    theme: getColorDWI(isDangerNew, isWarningNew),
                                                    content: (
                                                        <Tooltip content="Использовано">
                                                            <Text>{willBeUsagePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.min(willBeUsagePercent, 100),
                                                },
                                                {
                                                    theme: 'default',
                                                    content: willBeUsagePercent < 100 && (
                                                        <Tooltip content="Осталось">
                                                            <Text>{willBeFreePercent}%</Text>
                                                        </Tooltip>
                                                    ),
                                                    value: Math.min(willBeFreePercent, 100),
                                                },
                                            ]}
                                        />
                                    </>
                                );
                            })()}
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
        </div>
    );
};
