'use client';

import React from 'react';
import {ProductDTOGet} from '@/generated/api';
import ChartKit from '@gravity-ui/chartkit';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

interface BillingTabProps {
    product: ProductDTOGet;
}

const BillingTab: React.FC<BillingTabProps> = () => {
    const data: YagrWidgetData = {
        data: {
            timeline: [
                1636838612441, 1636925012441, 1637011412441, 1637097812441, 1637184212441,
                1637270612441, 1637357012441, 1637443412441, 1637529812441, 1637616212441,
            ],
            graphs: [
                {
                    id: '1',
                    name: 'Serie 2',
                    color: '#6e8188',
                    data: [37, 6, 51, 10, 65, 35, 72, 0, 94, 54],
                },
                {
                    id: '0',
                    name: 'Serie 1',
                    color: '#6c59c2',
                    data: [25, 52, 89, 72, 39, 49, 82, 59, 36, 5],
                },
            ],
        },
        libraryConfig: {
            chart: {
                series: {
                    type: 'area',
                },
            },
            title: {
                text: 'line: random 10 pts',
            },
        },
    };

    return (
        <div>
            <ChartKit type="yagr" data={data} />
        </div>
    );
};

export default BillingTab;
