'use client';

import React, {useEffect, useState} from 'react';
import {Button, Icon, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {OperationOA} from '@/generated/api';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {SelectRequestInterval} from '@/components/SelectRequestInterval';
import {Arrows3RotateLeft} from '@gravity-ui/icons';
import {mdbOperationApi} from '@/app/apis';
import {useAuth} from '@/context/AuthContext';
import {TextWithCopy} from '@/components/TextWithCopy';

interface OperationsTabProps {
    clusterId: string;
}

export const OperationsTab: React.FC<OperationsTabProps> = ({clusterId}) => {
    const [operations, setOperations] = useState<OperationOA[]>([]);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [selectedInterval, setSelectedInterval] = useState<number>(10); // Интервал в секундах
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const {checkPermission} = useAuth();

    const fetchData = async (clstrId: string) => {
        try {
            const response = await mdbOperationApi.listOperations({clusterId: clstrId});
            setOperations(response.data.operations);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching operations:', error);
        }
    };

    useEffect(() => {
        fetchData(clusterId);
    }, [clusterId]);

    useEffect(() => {
        if (isMonitoring) {
            const interval = setInterval(() => fetchData(clusterId), selectedInterval * 1000);
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
    }, [isMonitoring, selectedInterval, clusterId]);

    const handleToggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
    };

    const handleIntervalChange = (value: string[]) => {
        setSelectedInterval(parseInt(value[0], 10));
    };

    const handleRestartOperation = async (operationId: string) => {
        try {
            await mdbOperationApi.restartOperation({operationId});
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error restarting operation:', error);
        }
    };

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<OperationOA>[] = [
        {
            id: 'id',
            name: 'Id',
            template: (item) => <TextWithCopy text={item.id} maxLength={8} />,
        },
        {
            id: 'type',
            name: 'Тип',
            template: (operation) => operation.type.displayValue,
        },
        {
            id: 'status',
            name: 'Статус',
            template: (operation) => operation.status.displayValue,
        },
        {
            id: 'createdBy',
            name: 'Создано',
        },
        {
            id: 'createdAt',
            name: 'Дата создания',
            template: (operation) => new Date(operation.createdAt).toLocaleString(),
            meta: {
                sort: true,
            },
        },
        {
            id: 'updatedAt',
            name: 'Дата обновления',
            template: (operation) => new Date(operation.updatedAt).toLocaleString(),
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (operation) => (
                <HorizontalStack>
                    {operation.isRestartAllowed &&
                        checkPermission('cluster', 'operations', clusterId) && (
                            <Button
                                view="outlined-action"
                                size="m"
                                onClick={() => handleRestartOperation(operation.id)}
                            >
                                <Icon data={Arrows3RotateLeft} />
                            </Button>
                        )}
                </HorizontalStack>
            ),
        },
    ];

    return (
        <div style={{padding: '20px'}}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <SelectRequestInterval
                    lastUpdate={lastUpdate}
                    isMonitoring={isMonitoring}
                    selectedInterval={selectedInterval}
                    handleToggleMonitoring={handleToggleMonitoring}
                    handleIntervalChange={handleIntervalChange}
                />
            </div>
            <MyTable
                width="max"
                data={operations}
                // @ts-ignore
                columns={columns}
            />
        </div>
    );
};
