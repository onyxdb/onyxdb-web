'use client';

import React, {useEffect, useState} from 'react';
import {mdbManagedMongoDbApi} from '@/app/apis';
import {Pagination, Table, TableColumnConfig, TextInput, withTableSorting} from '@gravity-ui/uikit';
import {Eye} from '@gravity-ui/icons';
import {V1MongoClusterResponse} from '@/generated/api-mdb';
import {StatusLabel} from '@/components/common/StatusLabel';

export interface ClustersTableProps {
    viewAction: (clusterId: string) => void;
}

export const ClustersTable: React.FC<ClustersTableProps> = ({viewAction}) => {
    const [clustersAll, setClustersAll] = useState<V1MongoClusterResponse[]>([]);
    const [clustersFiltered, setClustersFiltered] = useState<V1MongoClusterResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    // const {checkPermission} = useAuth();

    const fetchClusters = async () => {
        try {
            const response = await mdbManagedMongoDbApi.listClusters();
            console.log('listClusters', response.data.clusters);
            setClustersAll(response.data.clusters);
            setTotal(response.data.clusters.length);
        } catch (error) {
            console.error('Error fetching clusters:', error);
        }
    };

    useEffect(() => {
        fetchClusters();
    }, []);

    const filterClusters = async () => {
        console.log(limit, offset, total);
        console.log(clustersAll);
        const filteredClusters = clustersAll
            .slice(offset, offset + limit)
            .filter(
                (p) =>
                    searchQuery.length === 0 ||
                    p.id === searchQuery ||
                    p.name.includes(searchQuery) ||
                    p.description.includes(searchQuery),
            );
        console.log(filteredClusters);
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

    const columns: TableColumnConfig<V1MongoClusterResponse>[] = [
        {
            id: 'view',
            name: '',
            template: (item) => (
                <Eye
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => viewAction(item.id ?? '')}
                />
            ),
        },
        {
            id: 'id',
            name: 'Id',
            template: (item) => item.id,
            meta: {
                sort: true,
            },
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
