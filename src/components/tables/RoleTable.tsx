'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Modal,
    Pagination,
    Table,
    TableColumnConfig,
    TextInput,
    withTableSorting,
} from '@gravity-ui/uikit';
import {rolesApi} from '@/app/apis';
import {RoleDTO} from '@/generated/api';
import CreateRoleRequestModal from '@/components/forms/CreateRoleRequestModal';
import {usePermissions} from '@/hooks/usePermissions';
import {getLinkedResourceLabel} from '@/utils/utils';

export interface RoleTableProps {
    onEdit: (roleId: string) => void;
    onDelete: (roleId: string) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({onEdit, onDelete}) => {
    const [roles, setRoles] = useState<RoleDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<RoleDTO | null>(null);

    const {checkPermission} = usePermissions();

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await rolesApi.getAllRoles({
                    search: searchQuery,
                    limit,
                    offset,
                });
                setRoles(response.data.data ?? []);
                setTotal(response.data.totalCount ?? 0);
            } catch (error) {
                console.error('Error fetching roles:', error);
            }
        };

        fetchRoles();
    }, [searchQuery, limit, offset]);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setOffset(0);
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setOffset((page - 1) * pageSize);
    };

    const handleOrderRole = (role: RoleDTO) => {
        setSelectedRole(role);
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const columns: TableColumnConfig<RoleDTO>[] = [
        {
            id: 'roleType',
            name: 'Role Type',
            template: (role) => role.roleType,
            meta: {
                sort: true,
            },
        },
        {
            id: 'shopName',
            name: 'Shop Name',
            template: (role) => role.shopName,
            meta: {
                sort: true,
            },
        },
        {
            id: 'description',
            name: 'Description',
            template: (role) => role.description,
        },
        {
            id: 'resource',
            name: 'Ресурс',
            template: (role) => getLinkedResourceLabel(role),
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (role) => (
                <div style={{display: 'flex', gap: '10px'}}>
                    <Button view="normal" size="m" onClick={() => handleOrderRole(role)}>
                        Заказать
                    </Button>
                    {checkPermission('web-global-role', 'edit') && (
                        <Button view="normal" size="m" onClick={() => onEdit(role.id ?? '???')}>
                            Редактировать
                        </Button>
                    )}
                    {checkPermission('web-global-role', 'delete') && (
                        <Button view="normal" size="m" onClick={() => onDelete(role.id ?? '???')}>
                            Удалить
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const MyTable = withTableSorting(Table);

    return (
        <div>
            <div style={{marginBottom: '20px'}}>
                <TextInput
                    placeholder="Поиск по имени роли"
                    value={searchQuery}
                    onUpdate={handleSearch}
                />
            </div>
            <MyTable
                data={roles}
                // @ts-ignore
                columns={columns}
                // onSort={(column: string, order: 'asc' | 'desc') => handleSort(column, order)}
                // sortState={sorting}
            />
            <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                <Pagination
                    page={offset / limit + 1}
                    pageSize={limit}
                    total={total}
                    onUpdate={handlePageChange}
                />
            </div>
            <Modal open={isModalVisible} onOpenChange={handleModalCancel}>
                {selectedRole && (
                    <CreateRoleRequestModal role={selectedRole} onCancel={handleModalCancel} />
                )}
            </Modal>
        </div>
    );
};

export default RoleTable;
