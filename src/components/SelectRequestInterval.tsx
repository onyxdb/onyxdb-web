import React from 'react';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Button, Select, Text, Tooltip} from '@gravity-ui/uikit';
import {formatDistanceToNow} from 'date-fns';
import {ru} from 'date-fns/locale';

interface SelectRequestIntervalProps {
    lastUpdate: Date | null;
    isMonitoring: boolean;
    selectedInterval: number;
    handleToggleMonitoring: () => void;
    handleIntervalChange: (value: string[]) => void;
}

export const SelectRequestInterval: React.FC<SelectRequestIntervalProps> = ({
    lastUpdate,
    isMonitoring,
    handleToggleMonitoring,
    selectedInterval,
    handleIntervalChange,
}) => {
    return (
        <HorizontalStack gap={10} align="center">
            <Tooltip content="Запукает автоматическую подгрузку данных каждые N времени">
                <Button
                    view={isMonitoring ? 'outlined-success' : 'outlined-info'}
                    size="m"
                    onClick={handleToggleMonitoring}
                >
                    {isMonitoring ? 'Слежение запущено' : 'Начать слежение'}
                </Button>
            </Tooltip>

            <Select
                size="m"
                placeholder="Выберите интервал"
                value={[selectedInterval.toString()]}
                onUpdate={handleIntervalChange}
            >
                <Select.Option value="1">1 секунда</Select.Option>
                <Select.Option value="3">3 секунды</Select.Option>
                <Select.Option value="5">5 секунд</Select.Option>
                <Select.Option value="10">10 секунд</Select.Option>
                <Select.Option value="60">1 минута</Select.Option>
            </Select>
            {lastUpdate && (
                <Text variant="subheader-1" color="secondary">
                    Последнее обновление:{' '}
                    {formatDistanceToNow(lastUpdate, {locale: ru, addSuffix: true})}
                </Text>
            )}
        </HorizontalStack>
    );
};
