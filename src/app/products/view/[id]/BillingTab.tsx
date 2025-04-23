'use client';

import React, {useEffect, useState} from 'react';
import {Button, Text, useToaster} from '@gravity-ui/uikit';
import {DateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {DatePicker} from '@gravity-ui/date-components';
import {mdbBillingApi} from '@/app/apis';
import {ProductDTOGet} from '@/generated/api';
import {ProductQuotaUsageReportItemOA} from '@/generated/api-mdb';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import ChartKit from '@gravity-ui/chartkit';
import {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

interface BillingTabProps {
    product: ProductDTOGet;
}

const BillingTab: React.FC<BillingTabProps> = ({product}) => {
    const [startDate, setStartDate] = useState<DateTime | null>(null);
    const [endDate, setEndDate] = useState<DateTime | null>(null);
    const [reportData, setReportData] = useState<ProductQuotaUsageReportItemOA[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const toaster = useToaster();

    useEffect(() => {
        // Устанавливаем текущую дату как конечную дату по умолчанию
        const now = dateTimeParse(new Date());
        if (now) {
            setEndDate(now);
        }
    }, []);

    const handleStartDateChange = (value: DateTime | null) => {
        setStartDate(value);
    };

    const handleEndDateChange = (value: DateTime | null) => {
        setEndDate(value);
    };

    const fetchReport = async () => {
        if (!startDate || !endDate) {
            setError('Пожалуйста, выберите начальную и конечную даты.');
            return;
        }
        setLoading(true);
        setError('');
        setReportData([]);
        try {
            const body = {
                productId: product.id,
                starDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
            };
            console.log('getProductQuotaUsageReport request', body);
            const response = await mdbBillingApi.getProductQuotaUsageReport(body);
            setReportData(response.data.items);
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

    const prepareChartData = (data: ProductQuotaUsageReportItemOA[]): YagrWidgetData => {
        const timeline = data.map((item) => item.timestamp);
        const usageData = data.map((item) => item.usage);
        const freeData = data.map((item) => item.free);
        const limitData = data.map((item) => item.limit);

        const maxY = Math.max(...usageData, ...limitData);
        const minY = Math.min(...usageData, ...freeData);
        console.log('minY', minY, 'maxY', maxY);
        return {
            data: {
                timeline,
                graphs: [
                    {
                        id: 'usage',
                        name: 'Использовано',
                        // color: '#6e8188',
                        // color: 'var(--g-color-private-blue-600-solid)',
                        color: 'var(--g-color-private-purple-600-solid)',
                        data: usageData,
                    },
                    // {
                    //     id: 'free',
                    //     name: 'Свободно',
                    //     // color: '#6c59c2',
                    //     color: 'var(--g-color-private-green-600-solid)',
                    //     data: freeData,
                    // },
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
        };
    };

    const chartData = prepareChartData(reportData);

    return (
        <div style={{padding: '20px'}}>
            <Text variant="subheader-1">Отчёт о использовании квот</Text>
            <div style={{marginTop: '20px'}}>
                <HorizontalStack gap={16} align="flex-end">
                    <div>
                        <div>
                            <Text>Начальная дата</Text>
                        </div>
                        <DatePicker value={startDate} onUpdate={handleStartDateChange} hasClear />
                    </div>
                    <div>
                        <div>
                            <Text>Конечная дата</Text>
                        </div>
                        <DatePicker value={endDate} onUpdate={handleEndDateChange} hasClear />
                    </div>
                    <Button view="action" size="m" onClick={fetchReport} disabled={loading}>
                        {loading ? 'Загрузка...' : 'Получить отчёт'}
                    </Button>
                </HorizontalStack>
            </div>
            {error && (
                <div style={{marginTop: '16px', color: 'red'}}>
                    <Text variant="body-1">{error}</Text>
                </div>
            )}
            {reportData.length > 0 && (
                <div style={{marginTop: '10px', height: '70vh'}}>
                    <ChartKit type="yagr" data={chartData} />
                </div>
            )}
        </div>
    );
};

export default BillingTab;
