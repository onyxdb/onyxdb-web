import React from 'react';
import {Progress, Text, Tooltip} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {ResourceUnit} from '@/components/ResourceInputField';
import {roundTo, toPercent} from '@/utils/math';
import {Quota} from '@/generated/api-mdb';

interface QuotaTransferSimulationResultProps {
    title: string;
    quota: Quota;
    transferAmount: number;
    unit: ResourceUnit;
    isSource?: boolean;
}

const getColorByStatus = (isDanger: boolean, isWarning: boolean) => {
    if (isDanger) return 'danger';
    if (isWarning) return 'warning';
    return 'success';
};

export const QuotaTransferSimulationResult: React.FC<QuotaTransferSimulationResultProps> = ({
    title,
    quota,
    transferAmount,
    unit,
    isSource = false,
}) => {
    // Расчет значений для текущего состояния
    const currentLimit = isSource ? quota.limit + transferAmount : quota.limit - transferAmount;
    const currentUsage = quota.usage;
    const currentUsagePercent = currentLimit > 0 ? (currentUsage / currentLimit) * 100 : 100;
    const currentFree = currentLimit - currentUsage;
    const currentFreePercent = currentLimit > 0 ? (currentFree / currentLimit) * 100 : 100;

    // Расчет значений для будущего состояния
    const futureLimit = quota.limit;
    const futureUsagePercent = futureLimit > 0 ? (currentUsage / futureLimit) * 100 : 100;
    const futureFree = futureLimit - currentUsage;
    const futureFreePercent = futureLimit > 0 ? (futureFree / futureLimit) * 100 : 100;

    // Определение статусов
    const isCurrentDanger = currentFree < 0;
    const isCurrentWarning = currentFreePercent <= 25;
    const isFutureDanger = futureFree < 0;
    const isFutureWarning = futureFreePercent <= 25;

    return (
        <div>
            <Text variant="body-1" color="secondary">
                {title}
            </Text>
            <Box marginTop="8px" style={{display: 'flex', flexDirection: 'column'}}>
                <Text variant="body-1">
                    Лимит: {roundTo(currentLimit / unit.coefficient, 0)}&nbsp;--&gt;&nbsp;
                    {roundTo(futureLimit / unit.coefficient, 0)}&nbsp;{unit.label}
                </Text>
                <Text variant="body-1">
                    Потребление: {roundTo(currentUsage / unit.coefficient, 2)}&nbsp;{unit.label}
                </Text>
                <Text variant="body-1">
                    Остаток: {roundTo(currentFree / unit.coefficient, 2)}&nbsp;--&gt;&nbsp;
                    {roundTo(futureFree / unit.coefficient, 2)}&nbsp;{unit.label}
                </Text>
            </Box>
            <Text variant="body-1" color="secondary">
                Использовано % до передачи
            </Text>
            <Progress
                stack={[
                    {
                        theme: getColorByStatus(isCurrentDanger, isCurrentWarning),
                        content: (
                            <Tooltip content="Использовано">
                                <Text>{roundTo(currentUsagePercent, 0)}%</Text>
                            </Tooltip>
                        ),
                        value: toPercent(currentUsagePercent),
                    },
                    {
                        theme: 'misc',
                        content: currentUsagePercent < 100 && (
                            <Tooltip content="Осталось">
                                <Text>{roundTo(currentFreePercent, 0)}%</Text>
                            </Tooltip>
                        ),
                        value: toPercent(currentFreePercent),
                    },
                ]}
            />
            <Text variant="body-1" color="secondary">
                Использовано % после передачи
            </Text>
            <Progress
                stack={[
                    {
                        theme: getColorByStatus(isFutureDanger, isFutureWarning),
                        content: (
                            <Tooltip content="Использовано">
                                <Text>{roundTo(futureUsagePercent, 0)}%</Text>
                            </Tooltip>
                        ),
                        value: toPercent(futureUsagePercent),
                    },
                    {
                        theme: 'misc',
                        content: futureUsagePercent < 100 && (
                            <Tooltip content="Осталось">
                                <Text>{roundTo(futureFreePercent, 0)}%</Text>
                            </Tooltip>
                        ),
                        value: toPercent(futureFreePercent),
                    },
                ]}
            />
        </div>
    );
};
