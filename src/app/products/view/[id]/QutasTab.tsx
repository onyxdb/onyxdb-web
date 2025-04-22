'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Modal,
    Progress,
    Table,
    TableColumnConfig,
    Text,
    withTableSorting,
} from '@gravity-ui/uikit';
import {Quota, Resource, ResourceUnitEnum} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import {useAuth} from '@/context/AuthContext';
import {Box} from '@/components/Layout/Box';
import {SelectRequestInterval} from '@/components/SelectRequestInterval';
import CreateQuotaModal from '@/components/modals/CreateQuotaModal';
import {TransferQuotaModal} from '@/components/modals/TransferQuotaModal';
import {ProductDTOGet} from '@/generated/api';

interface QuotasTabProps {
    product: ProductDTOGet;
}

const QuotasTab: React.FC<QuotasTabProps> = ({product}) => {
    const [quotas, setQuotas] = useState<Quota[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<number>(3);
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState<boolean>(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const {checkPermission} = useAuth();
    const convertRamToGB = (ram: number) => (ram / 1024 / 1024 / 1024).toFixed(2);

    const fetchData = async (productId: string) => {
        try {
            const quotasResponse = await mdbQuotasApi.listQuotasByProducts({
                productIds: [productId],
            });
            setQuotas(quotasResponse.data.products[0].quotas);
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
        fetchData(product.id);
        fetchResources();
    }, [product.id]);

    useEffect(() => {
        if (isMonitoring) {
            const interval = setInterval(() => fetchData(product.id), selectedInterval * 1000);
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
    }, [isMonitoring, selectedInterval, product.id]);

    const handleToggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
    };

    const handleIntervalChange = (value: string[]) => {
        setSelectedInterval(parseInt(value[0], 10));
    };

    const handleCreateQuota = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleExchangeQuotasModal = () => {
        setIsExchangeModalOpen(true);
    };

    const handleCloseExchangeModal = () => {
        setIsExchangeModalOpen(false);
        fetchData(product.id);
    };

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<Quota>[] = [
        {
            id: 'resource',
            name: 'Ресурс',
            template: (quota) => {
                return (
                    <Text variant="subheader-1" color="secondary">
                        {quota.resource.description}&nbsp;({quota.resource.name})
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
            template: (quota) => {
                if (quota.resource.unit === ResourceUnitEnum.Bytes) {
                    return (
                        <Text variant="subheader-1" color="secondary">
                            {convertRamToGB(quota.limit).toLocaleString()}&nbsp;GB
                        </Text>
                    );
                }
                return (
                    <Text variant="subheader-1" color="secondary">
                        {quota.limit.toLocaleString()}&nbsp;{quota.resource.unit}
                    </Text>
                );
            },
        },
        {
            id: 'usage',
            name: 'Использовано',
            meta: {
                sort: true,
            },
            template: (quota) => {
                if (quota.resource.unit === ResourceUnitEnum.Bytes) {
                    return (
                        <Text variant="subheader-1" color="secondary">
                            {convertRamToGB(quota.usage).toLocaleString()}&nbsp;GB
                        </Text>
                    );
                }
                return (
                    <Text variant="subheader-1" color="secondary">
                        {quota.usage.toLocaleString()}&nbsp;{quota.resource.unit}
                    </Text>
                );
            },
        },
        {
            id: 'free',
            name: 'Свободно',
            meta: {
                sort: true,
            },
            template: (quota) => {
                if (quota.resource.unit === ResourceUnitEnum.Bytes) {
                    return (
                        <Text variant="subheader-1" color="secondary">
                            {convertRamToGB(quota.free).toLocaleString()}&nbsp;GB
                        </Text>
                    );
                }
                return (
                    <Text variant="subheader-1" color="secondary">
                        {quota.free.toLocaleString()}&nbsp;{quota.resource.unit}
                    </Text>
                );
            },
        },
        {
            id: 'usage_in_perc',
            name: 'Использовано, %',
            template: (quota) => {
                const usedPercentage = (quota.usage / quota.limit) * 100;
                const freePercentage = (quota.free / quota.limit) * 100;

                if (usedPercentage > 100) {
                    return (
                        <Progress
                            stack={[
                                {
                                    theme: 'danger',
                                    content: `${usedPercentage}%`,
                                    value: 100,
                                },
                            ]}
                        />
                    );
                }
                return (
                    <Progress
                        stack={[
                            {
                                theme: usedPercentage > 75 ? 'warning' : 'default',
                                content: `${usedPercentage}%`,
                                value: usedPercentage,
                            },
                            {
                                theme: 'success',
                                content: `${freePercentage}%`,
                                value: freePercentage,
                            },
                        ]}
                    />
                );
            },
        },
        // {
        //     id: 'actions',
        //     name: 'Действия',
        //     template: (quota) => (
        //         <HorizontalStack gap={10}>
        //             {quota.limit}
        //             {/* Добавьте действия по необходимости */}
        //         </HorizontalStack>
        //     ),
        // },
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
                {checkPermission('quota', 'transfer') && (
                    <Button view="action" size="m" onClick={handleExchangeQuotasModal}>
                        Передать квоты между продуктами
                    </Button>
                )}
                {checkPermission('quota', 'create') && (
                    <Button
                        view="action"
                        size="m"
                        onClick={handleCreateQuota}
                        style={{marginLeft: '20px'}}
                    >
                        Загрузить квоту
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

            <Modal open={isExchangeModalOpen} onOpenChange={handleCloseExchangeModal}>
                <TransferQuotaModal
                    product={product}
                    resources={resources}
                    closeAction={handleCloseExchangeModal}
                />
            </Modal>

            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <CreateQuotaModal productId={product.id} closeAction={handleCloseCreateModal} />
            </Modal>
        </div>
    );
};

export default QuotasTab;
