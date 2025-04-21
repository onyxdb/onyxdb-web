'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Modal,
    Progress,
    Select,
    Table,
    TableColumnConfig,
    Text,
    useToaster,
    withTableSorting,
} from '@gravity-ui/uikit';
import {
    ExchangeQuotasBetweenProductsRequest,
    Quota,
    QuotaToExchange,
    Resource,
    SimulateQuotasExchangeBetweenProductsResponse,
} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import {InputField} from '@/components/formik/InputField';
import {useAuth} from '@/context/AuthContext';
import {ProductDTOGet} from '@/generated/api';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {ProductSelector} from '@/components/ProductSelector';
import CreateQuotaModal from '@/components/forms/CreateQuotaModal';
import {SelectRequestInterval} from '@/components/SelectRequestInterval';

interface QuotasTabProps {
    productId: string;
}

const QuotasTab: React.FC<QuotasTabProps> = ({productId}) => {
    const [quotas, setQuotas] = useState<Quota[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<number>(3);
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const [fromProduct, setFromProduct] = useState<ProductDTOGet | null>(null);
    const [toProduct, setToProduct] = useState<ProductDTOGet | null>(null);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
    const [exchangeQuotas, setExchangeQuotas] = useState<QuotaToExchange[]>([
        {
            id: '',
            resourceId: '',
            limit: 0,
        },
    ]);
    const [simulationResult, setSimulationResult] =
        useState<SimulateQuotasExchangeBetweenProductsResponse | null>(null);

    const toaster = useToaster();

    const fetchData = async () => {
        try {
            const quotasResponse = await mdbQuotasApi.listQuotasByProduct({productId});
            setQuotas(quotasResponse.data.quotas);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching quotas:', error);
        }
    };

    const fetchResources = async () => {
        try {
            const resourcesResponse = await mdbQuotasApi.listResources();
            setResources(resourcesResponse.data.resources);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchResources();
    }, [productId]);

    useEffect(() => {
        if (isMonitoring) {
            const interval = setInterval(fetchData, selectedInterval * 1000);
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
    }, [isMonitoring, selectedInterval, productId]);

    const handleToggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
    };

    const handleIntervalChange = (value: string[]) => {
        setSelectedInterval(parseInt(value[0], 10));
    };

    const handleCreateQuota = () => {
        // Логика для создания квоты
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleExchangeQuotas = () => {
        // Логика для обмена квотами
        setIsExchangeModalOpen(true);
    };

    const handleCloseExchangeModal = () => {
        setIsExchangeModalOpen(false);
        setSimulationResult(null);
    };

    const handleFromProductSelect = (productDTO: ProductDTOGet) => {
        setFromProduct(productDTO);
    };

    const handleToProductSelect = (productDTO: ProductDTOGet) => {
        setToProduct(productDTO);
    };

    const handleResourceChange = (value: string[]) => {
        const selected = resources.find((resource) => resource.id === value[0]);
        setSelectedResource(selected || null);
        const updatedQuotas = exchangeQuotas.map((quota, index) => {
            if (index === 0) {
                return {
                    ...quota,
                    resourceId: value,
                };
            }
            return quota;
        });
        setExchangeQuotas(updatedQuotas);
    };

    const handleQuotaLimitChange = (value: number) => {
        const updatedQuotas = exchangeQuotas.map((quota, index) => {
            if (index === 0) {
                return {
                    ...quota,
                    limit: value,
                };
            }
            return quota;
        });
        setExchangeQuotas(updatedQuotas);
    };

    const handleSimulateQuotasExchange = async () => {
        if (!fromProduct || !toProduct || !selectedResource) return;

        const request: ExchangeQuotasBetweenProductsRequest = {
            fromProductId: fromProduct.id,
            toProductId: toProduct.id,
            quotas: [
                {
                    id: '',
                    resourceId: selectedResource.id,
                    limit: exchangeQuotas[0].limit,
                },
            ],
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

    const handleConfirmExchangeQuotas = async () => {
        if (!fromProduct || !toProduct || !selectedResource || !simulationResult) return;

        const request: ExchangeQuotasBetweenProductsRequest = {
            fromProductId: fromProduct.id,
            toProductId: toProduct.id,
            quotas: [
                {
                    id: '',
                    resourceId: selectedResource.id,
                    limit: exchangeQuotas[0].limit,
                },
            ],
        };

        try {
            await mdbQuotasApi.exchangeQuotasBetweenProducts({
                exchangeQuotasBetweenProductsRequest: request,
            });
            fetchData();
            handleCloseExchangeModal();
            toaster.add({
                name: 'Квоты успешно обменены',
                title: 'Квоты успешно обменены',
                content: 'Операция выполнена успешно.',
                theme: 'success',
            });
        } catch (error) {
            console.error('Error exchanging quotas:', error);
            toaster.add({
                name: 'Ошибка обмена квот',
                title: 'Ошибка обмена квот',
                content: 'Консистентность изменилась, перевод не удался.',
                theme: 'danger',
            });
        }
    };

    const handleAddQuota = () => {
        setExchangeQuotas([...exchangeQuotas, {id: '', resourceId: '', limit: 0}]);
    };

    const handleRemoveQuota = (index: number) => {
        const updatedQuotas = exchangeQuotas.filter((_, i) => i !== index);
        setExchangeQuotas(updatedQuotas);
    };

    const resourceOptions = resources.map((resource) => (
        <Select.Option key={resource.id} value={resource.id}>
            {/*{resource.name} ({resource.units})*/} TODO
            {resource.name} (units)
        </Select.Option>
    ));

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<Quota>[] = [
        {
            id: 'resource',
            name: 'Ресурс',
            template: (quota) => {
                const resource = resources.find((r) => r.id === quota.resourceId);
                return resource ? (
                    <Text variant="subheader-1" color="secondary">
                        {/*{resource.name} ({resource.units})*/} TODO
                        {resource.name} (units)
                    </Text>
                ) : (
                    <Text variant="subheader-1" color="secondary">
                        Неизвестный ресурс
                    </Text>
                );
            },
        },
        {
            id: 'limit',
            name: 'Лимит',
            meta: {
                sort: true,
            },
            template: (quota) => (
                <Text variant="subheader-1" color="secondary">
                    {quota.limit.toLocaleString()}
                </Text>
            ),
        },
        {
            id: 'allocation',
            name: 'Использование',
            meta: {
                sort: true,
            },
            template: (quota) => {
                const resource = resources.find((r) => r.id === quota.resourceId);
                if (!resource)
                    return (
                        <Text variant="subheader-1" color="secondary">
                            Неизвестный ресурс
                        </Text>
                    );
                const usedPercentage = (quota.allocation / quota.limit) * 100;
                const freePercentage = (quota.free / quota.limit) * 100;

                return (
                    <Progress
                        stack={[
                            {theme: 'default', content: 'Использовано', value: usedPercentage},
                            {theme: 'success', content: 'Осталось', value: freePercentage},
                        ]}
                    />
                );
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (quota) => (
                <HorizontalStack gap={10}>
                    {quota.limit}
                    {/* Добавьте действия по необходимости */}
                </HorizontalStack>
            ),
        },
    ];

    return (
        <div>
            <SelectRequestInterval
                lastUpdate={lastUpdate}
                isMonitoring={isMonitoring}
                selectedInterval={selectedInterval}
                handleToggleMonitoring={handleToggleMonitoring}
                handleIntervalChange={handleIntervalChange}
            />
            <Box marginTop="20px">
                <Button view="action" size="m" onClick={handleExchangeQuotas}>
                    Передать квоты между продуктами
                </Button>
                {useAuth().checkPermission('quota', 'create') && (
                    <Button
                        view="action"
                        size="m"
                        onClick={handleCreateQuota}
                        style={{marginLeft: '20px'}}
                    >
                        Создать квоту
                    </Button>
                )}
            </Box>
            <Box marginTop="20px">
                <MyTable
                    width="max"
                    data={quotas}
                    // @ts-ignore
                    columns={columns}
                />
            </Box>
            {isExchangeModalOpen && (
                <Modal open={true} onOpenChange={handleCloseExchangeModal}>
                    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
                        <Text variant="header-1">Передача квот между продуктами</Text>
                        <Box marginTop="20px">
                            <HorizontalStack gap={20}>
                                <Box>
                                    <Text variant="header-2">Отдающий продукт</Text>
                                    <ProductSelector
                                        selectProductAction={handleFromProductSelect}
                                    />
                                </Box>
                                <Box>
                                    <Text variant="header-2">Принимающий продукт</Text>
                                    <ProductSelector selectProductAction={handleToProductSelect} />
                                </Box>
                            </HorizontalStack>
                        </Box>
                        <Box marginTop="20px">
                            <Text variant="header-2">Выбор ресурса и лимита</Text>
                            <Box marginBottom="10px">
                                <Select
                                    size="m"
                                    placeholder="Выберите ресурс"
                                    value={[selectedResource?.id || '']}
                                    onUpdate={handleResourceChange}
                                >
                                    {resourceOptions}
                                </Select>
                            </Box>
                            <Box marginBottom="10px">
                                <InputField
                                    label="Лимит"
                                    name="limit"
                                    value={exchangeQuotas[0].limit.toString()}
                                    onChange={(value) =>
                                        handleQuotaLimitChange(parseInt(value, 10))
                                    }
                                    onBlur={() => {}}
                                    error={
                                        simulationResult &&
                                        simulationResult.fromProduct.quotas[0].limit < 0
                                            ? 'Недостаточно квот'
                                            : undefined
                                    }
                                    placeholder="Введите лимит"
                                    type="number"
                                    // endContent={selectedResource?.units} TODO
                                />
                            </Box>
                            <Box marginBottom="20px">
                                <Button
                                    view="normal"
                                    size="m"
                                    onClick={handleSimulateQuotasExchange}
                                >
                                    Симулировать
                                </Button>
                            </Box>
                        </Box>
                        {simulationResult && (
                            <Box marginTop="20px">
                                <Text variant="header-2">Результат симуляции</Text>
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
                                                //             simulationResult[0].limit) *
                                                //         100,
                                                // },
                                                // {
                                                //     theme: 'success',
                                                //     content: 'Осталось',
                                                //     value:
                                                //         (simulationResult[0].free /
                                                //             simulationResult[0].limit) *
                                                //         100,
                                                // },
                                                {
                                                    theme: 'danger',
                                                    content: 'Отдаёт',
                                                    value:
                                                        (exchangeQuotas[0].limit /
                                                            simulationResult.fromProduct.quotas[0]
                                                                .limit) *
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
                                                //         (simulationResult[1].allocation /
                                                //             simulationResult[1].limit) *
                                                //         100,
                                                // },
                                                // {
                                                //     theme: 'success',
                                                //     content: 'Осталось',
                                                //     value:
                                                //         (simulationResult[1].free /
                                                //             simulationResult[1].limit) *
                                                //         100,
                                                // },
                                                {
                                                    theme: 'warning',
                                                    content: 'Получает',
                                                    value:
                                                        (exchangeQuotas[0].limit /
                                                            simulationResult.toProduct.quotas[1]
                                                                .limit) *
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
                                    view="action"
                                    size="m"
                                    onClick={handleConfirmExchangeQuotas}
                                    disabled={
                                        !simulationResult ||
                                        simulationResult.toProduct.quotas[0].limit < 0 ||
                                        simulationResult.fromProduct.quotas[0].limit < 0
                                    }
                                >
                                    Обменять квоты
                                </Button>
                                <Box marginLeft="20px">
                                    <Button
                                        view="normal"
                                        size="m"
                                        onClick={handleCloseExchangeModal}
                                    >
                                        Отмена
                                    </Button>
                                </Box>
                            </HorizontalStack>
                        </Box>
                    </div>
                </Modal>
            )}
            {isCreateModalOpen && (
                <CreateQuotaModal closeAction={handleCloseCreateModal} submitAction={() => {}} />
            )}
        </div>
    );
};

export default QuotasTab;
