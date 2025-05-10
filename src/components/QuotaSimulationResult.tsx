import React from 'react';
import {Progress, Text, Tooltip} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {ResourceUnit} from '@/components/ResourceInputField';
import {roundTo, toPercent} from '@/utils/math';
import {Quota} from '@/generated/api';

interface QuotaSimulationResultProps {
    title: string;
    quota: Quota;
    unit: ResourceUnit;
}

const getColorByStatus = (isDanger: boolean, isWarning: boolean) => {
    if (isDanger) return 'danger';
    if (isWarning) return 'warning';
    return 'success';
};

export const QuotaSimulationResult: React.FC<QuotaSimulationResultProps> = ({
    title,
    quota,
    unit,
}) => {
    const usagePercent = quota.limit > 0 ? (quota.usage / quota.limit) * 100 : 100;
    const freePercent = quota.limit > 0 ? (quota.free / quota.limit) * 100 : 100;

    const isDanger = quota.free < 0;
    const isWarning = freePercent <= 25;

    return (
        <div>
            <Text variant="body-1" color="secondary">
                {title}
            </Text>
            <Box marginTop="8px" style={{display: 'flex', flexDirection: 'column'}}>
                <Text variant="body-1">
                    Лимит: {roundTo(quota.limit / unit.coefficient, 0)}&nbsp;{unit.label}
                </Text>
                <Text variant="body-1">
                    Потребление: {roundTo(quota.usage / unit.coefficient, 2)}&nbsp;{unit.label}
                </Text>
                <Text variant="body-1">
                    Остаток: {roundTo(quota.free / unit.coefficient, 2)}&nbsp;{unit.label}
                </Text>
            </Box>
            <Text variant="body-1" color="secondary">
                Использовано %
            </Text>
            <Progress
                stack={[
                    {
                        theme: getColorByStatus(isDanger, isWarning),
                        content: (
                            <Tooltip content="Использовано">
                                <Text>{roundTo(usagePercent, 0)}%</Text>
                            </Tooltip>
                        ),
                        value: toPercent(usagePercent),
                    },
                    {
                        theme: 'misc',
                        content: usagePercent < 100 && (
                            <Tooltip content="Осталось">
                                <Text>{roundTo(freePercent, 0)}%</Text>
                            </Tooltip>
                        ),
                        value: toPercent(freePercent),
                    },
                ]}
            />
        </div>
    );
};
