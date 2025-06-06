'use client';

import React, {useEffect, useState} from 'react';
import {mdbApi} from '@/app/apis';
import {Pagination, Table, TableColumnConfig, TextInput, withTableSorting} from '@gravity-ui/uikit';
import {Eye} from '@gravity-ui/icons';
import {MongoClusterDTO} from '@/generated/api';
import {StatusLabel} from '@/components/common/StatusLabel';
import {useRouter} from 'next/navigation';
import {TextWithCopy} from '@/components/common/TextWithCopy';

export interface ClustersTableProps {
    projectsIds?: string[];
}

export const ClustersTable: React.FC<ClustersTableProps> = ({projectsIds}) => {
    const [clustersAll, setClustersAll] = useState<MongoClusterDTO[]>([]);
    const [clustersFiltered, setClustersFiltered] = useState<MongoClusterDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const router = useRouter();

    const fetchClusters = async () => {
        try {
            const response = await mdbApi.listClusters();
            const filteredClusters = projectsIds
                ? response.data.clusters.filter((p) => projectsIds.includes(p.projectId))
                : response.data.clusters;
            setClustersAll(filteredClusters);
            setTotal(filteredClusters.length);
        } catch (error) {
            console.error('Error fetching clusters:', error);
        }
    };

    useEffect(() => {
        fetchClusters();
    }, []);

    const filterClusters = async () => {
        const filteredClusters = clustersAll
            .slice(offset, offset + limit)
            .filter(
                (p) =>
                    searchQuery.length === 0 ||
                    p.id === searchQuery ||
                    p.name.includes(searchQuery) ||
                    p.description.includes(searchQuery),
            );
        setClustersFiltered(filteredClusters);
    };

    useEffect(() => {
        filterClusters();
    }, [clustersAll.length, searchQuery, limit, offset]);

    const handlePageChange = (page: number, pageSize: number) => {
        setLimit(pageSize);
        setOffset((page - 1) * pageSize);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setOffset(0);
    };

    const handleView = (clusterId: string) => {
        router.push(`/clusters/view/${clusterId}`);
    };

    const columns: TableColumnConfig<MongoClusterDTO>[] = [
        {
            id: 'view',
            name: '',
            template: (item) => (
                <Eye
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => handleView(item.id)}
                />
            ),
        },
        {
            id: 'id',
            name: 'Id',
            template: (item) => <TextWithCopy text={item.id} maxLength={8} />,
        },
        {
            id: 'name',
            name: 'Название',
            template: (item) => item.name,
            meta: {
                sort: true,
            },
        },
        {
            id: 'status',
            name: 'Статус',
            template: (item) => <StatusLabel status={item.status.value} />,
            meta: {
                sort: true,
            },
        },
        {
            id: 'projectId',
            name: 'Проект',
            template: (item) => item.projectId,
        },
    ];

    const MyTable = withTableSorting(Table);

    return (
        <div>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по кластерам"
                    value={searchQuery}
                    onUpdate={handleSearch}
                />
            </div>
            <MyTable
                width="max"
                data={clustersFiltered}
                // @ts-ignore
                columns={columns}
            />
            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                <Pagination
                    page={offset / limit + 1}
                    pageSize={limit}
                    pageSizeOptions={[5, 10, 20, 100]}
                    total={total}
                    onUpdate={handlePageChange}
                />
            </div>
        </div>
    );
};

export default ClustersTable;
