'use client';

import React, {useEffect, useState} from 'react';
import {Button, Table, TableColumnConfig, withTableSorting} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {AccountDTO, ProductDTO} from '@/generated/api';
import {accountsApi, productsApi} from '@/app/apis';

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);
    // const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        productsApi
            .getAllProducts()
            .then((response) => setProducts(response.data))
            .catch((error) => console.error('Error fetching products:', error));
    }, []);

    useEffect(() => {
        accountsApi
            .getAllAccounts()
            .then((response) => setAccounts(response.data.data ?? []))
            .catch((error) => console.error('Error fetching accounts:', error));
    }, []);

    const MyTable = withTableSorting(Table);

    const columns: TableColumnConfig<ProductDTO>[] = [
        {
            id: 'name',
            name: 'Название',
            template: (product) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/products/${product.id}/info`)}
                >
                    {product.name}
                </span>
            ),
            meta: {
                sort: true,
            },
        },
        {
            id: 'description',
            name: 'Описание',
        },
        {
            id: 'createdAt',
            name: 'Дата создания',
            meta: {
                sort: true,
            },
        },
        {
            id: 'ownerId',
            name: 'Владелец',
            template: (product) => (
                <span
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => router.push(`/accounts/${product.ownerId}/info`)}
                >
                    {accounts.find((x) => x.id == product.ownerId)?.username ?? 'not stated'}
                </span>
            ),
        },
    ];

    const handleCreateProduct = () => {
        router.push('/products/create');
    };

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
                <h1>Каталог проектов</h1>
                <Button view="action" size="l" onClick={handleCreateProduct}>
                    Создать проект
                </Button>
            </div>
            {/*<div style={{marginBottom: '20px'}}>*/}
            {/*    <TextInput*/}
            {/*        placeholder="Поиск по названию"*/}
            {/*        value={searchQuery}*/}
            {/*        onUpdate={(value) => setSearchQuery(value)}*/}
            {/*    />*/}
            {/*</div>*/}
            <MyTable
                data={products}
                columns={columns}
                // onSort={(column: string, order: 'asc' | 'desc') => handleSort(column, order)}
                // sortState={sorting}
            />
        </div>
    );
}
