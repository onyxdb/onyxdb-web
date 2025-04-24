'use client';

import React, {useState} from 'react';
import {Button, Card, Label, Text} from '@gravity-ui/uikit';
import {DateTime} from '@gravity-ui/date-utils';
import {RangeCalendar, RangeValue} from '@gravity-ui/date-components';
import {mdbBillingApi} from '@/app/apis';
import {ProductDTOGet} from '@/generated/api';
import {ProductQuotaUsageByResourceOA, Resource} from '@/generated/api-mdb';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import ChartKit from '@gravity-ui/chartkit';
import {YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

type ResourceYagrWidgetData = {
    resource: Resource;
    data: YagrWidgetData;
};

interface BillingTabProps {
    product: ProductDTOGet;
}

const BillingTab: React.FC<BillingTabProps> = ({product}) => {
    const [rangeDate, setRangeDate] = useState<RangeValue<DateTime> | null>(null);
    const [reportData, setReportData] = useState<ProductQuotaUsageByResourceOA[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleDateChange = (value: RangeValue<DateTime> | null) => {
        setRangeDate(value);
    };

    const fetchReport = async () => {
        if (!rangeDate) {
            setError('Пожалуйста, выберите начальную и конечную даты.');
            return;
        }
        setLoading(true);
        setError('');
        setReportData([]);
        try {
            const body = {
                productId: product.id,
                startDate: rangeDate.start.format('YYYY-MM-DD'),
                endDate: rangeDate.end.format('YYYY-MM-DD'),
            };
            console.log('getProductQuotaUsageReport request', body);
            const response = await mdbBillingApi.getProductQuotaUsageReport(body);
            setReportData(response.data.resources);
            console.log('getProductQuotaUsageReport response', response);
        } catch (fetchError) {
            console.error('Ошибка при получении отчёта о квотах:', fetchError);
            setError(
                'Не удалось получить отчёт о квотах. Пожалуйста, проверьте даты и попробуйте снова.',
            );
            toaster.add({
                name: 'error_get_billing',
                title: 'Ошибка получения отчёта',
                content: `Не удалось получить отчёт: ${fetchError}.`,
                theme: 'danger',
            });
        } finally {
            setLoading(false);
        }
    };

    const prepareChartData = (data: ProductQuotaUsageByResourceOA): ResourceYagrWidgetData => {
        const timeline = data.items.map((item) => item.timestamp);
        const usageData = data.items.map((item) => item.usage);
        const freeData = data.items.map((item) => item.free);
        const limitData = data.items.map((item) => item.limit);

        const maxY = Math.max(...usageData, ...limitData);
        const minY = Math.min(...usageData, ...freeData);
        console.log('minY', minY, 'maxY', maxY);
        return {
            resource: data.resource,
            data: {
                data: {
                    timeline,
                    graphs: [
                        {
                            id: 'usage',
                            name: 'Использовано',
                            color: 'var(--g-color-private-purple-600-solid)',
                            data: usageData,
                        },
                        {
                            id: 'limit',
                            name: 'Лимит',
                            // color: 'var(--g-color-private-yellow-550-solid)',
                            color: 'var(--g-color-private-yellow-550-solid)',
                            data: limitData,
                        },
                    ],
                },
                libraryConfig: {
                    chart: {
                        series: {
                            type: 'area',
                        },
                        select: {
                            zoom: false,
                        },
                    },
                    title: {
                        text: `Использование квот для продукта ${product.name}`,
                    },
                    legend: {
                        show: true,
                        position: 'top',
                    },
                },
            },
        };
    };

    const chartsData = reportData.map((d) => prepareChartData(d));
    return (
        <div style={{padding: '20px'}}>
            <HorizontalStack justify="space-between">
                <Card>
                    <div>
                        <RangeCalendar value={rangeDate} onUpdate={handleDateChange} />
                    </div>
                    <Button view="action" size="m" onClick={fetchReport} disabled={loading}>
                        {loading ? 'Загрузка...' : 'Получить отчёт'}
                    </Button>
                </Card>
                <div>
                    {error && (
                        <div style={{marginTop: '16px', color: 'red'}}>
                            <Text variant="body-1">{error}</Text>
                        </div>
                    )}
                    {chartsData.map((cd) => (
                        <>
                            <Text>
                                График потребления квот по ресурсу{' '}
                                <Label>{cd.resource.description}</Label>
                            </Text>
                            <div style={{marginTop: '10px', height: '70vh'}}>
                                <ChartKit type="yagr" data={cd.data} />
                            </div>
                        </>
                    ))}
                </div>
            </HorizontalStack>
        </div>
    );
};

export default BillingTab;
