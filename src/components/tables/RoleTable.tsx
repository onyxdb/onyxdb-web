'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Icon,
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
import {useAuth} from '@/context/AuthContext';
import {getLinkedResourceLabel} from '@/utils/utils';
import {Box} from '@/components/Layout/Box';
import {Pencil, TrashBin} from '@gravity-ui/icons';

export interface RoleTableProps {
    editAction: (roleId: string) => void;
    deleteAction: (roleId: string) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({editAction, deleteAction}) => {
    const [roles, setRoles] = useState<RoleDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedRole, setSelectedRole] = useState<RoleDTO | null>(null);

    const {checkPermission} = useAuth();

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
        setLimit(pageSize);
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
                    {checkPermission('role', 'edit') && (
                        <Button view="normal" size="m" onClick={() => editAction(role.id)}>
                            <Icon data={Pencil} />
                        </Button>
                    )}
                    {checkPermission('role', 'delete') && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => deleteAction(role.id)}
                        >
                            <Icon data={TrashBin} />
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
            <div>
                <MyTable
                    width="max"
                    data={roles}
                    // @ts-ignore
                    columns={columns}
                />
                <Box marginTop="20px">
                    <Pagination
                        page={offset / limit + 1}
                        pageSize={limit}
                        pageSizeOptions={[5, 10, 20, 100]}
                        total={total}
                        onUpdate={handlePageChange}
                    />
                </Box>
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
