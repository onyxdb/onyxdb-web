import React from 'react';
import {Progress, Text, Tooltip} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';

interface Quota {
    limit: number;
    usage: number;
    free: number;
    resource: {
        unit: string;
    };
}

interface QuotaTransferSimulationResultProps {
    title: string;
    quota: Quota;
    transferAmount: number;
    isSource?: boolean;
}

const getColorByStatus = (isDanger: boolean, isWarning: boolean) => {
    if (isDanger) return 'danger';
    if (isWarning) return 'warning';
    return 'success';
};

function roundTo(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
}

function toPercent(num: number) {
    return Math.min(Math.max(num, 0), 100);
}

export const QuotaTransferSimulationResult: React.FC<QuotaTransferSimulationResultProps> = ({
    title,
    quota,
    transferAmount,
    isSource,
}) => {
    // Расчет значений для текущего состояния
    const currentLimit = isSource ? quota.limit + transferAmount : quota.limit - transferAmount;
    const currentUsage = quota.usage;
    const currentUsagePercent = (currentUsage / currentLimit) * 100;
    const currentFree = isSource ? quota.free + transferAmount : quota.free - transferAmount;
    const currentFreePercent = (currentFree / currentLimit) * 100;

    // Расчет значений для будущего состояния
    const futureLimit = quota.limit;
    const futureUsagePercent = (currentUsage / futureLimit) * 100;
    const futureFree = quota.free;
    const futureFreePercent = (futureFree / futureLimit) * 100;

    // Определение статусов
    const isCurrentDanger = currentFree < 0;
    const isCurrentWarning = currentFreePercent <= 25;
    const isFutureDanger = futureFree < 0;
    const isFutureWarning = futureFreePercent <= 25;

    // console.log(
    //     title,
    //     'current',
    //     currentLimit,
    //     currentUsage,
    //     currentUsagePercent,
    //     currentFree,
    //     currentFreePercent,
    // );
    // console.log(
    //     title,
    //     'future',
    //     futureLimit,
    //     currentUsage,
    //     futureUsagePercent,
    //     futureFree,
    //     futureFreePercent,
    // );
    return (
        <div>
            <Text variant="body-1" color="secondary">
                {title}
            </Text>

            <Box marginTop="8px" style={{display: 'flex', flexDirection: 'column'}}>
                <Text variant="body-1">
                    Лимит: {currentLimit}&nbsp;--&gt;&nbsp;{futureLimit}&nbsp;{quota.resource.unit}
                </Text>
                <Text variant="body-1">
                    Потребление: {currentUsage}&nbsp;{quota.resource.unit}
                </Text>
                <Text variant="body-1">
                    Остаток: {currentFree}&nbsp;--&gt;&nbsp;{futureFree}&nbsp;{quota.resource.unit}
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
