'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi, rolesApi, rolesRequestsApi} from '@/app/apis';
import {AccountDTO, RoleDTO, RoleRequestDTO, RoleRequestDTOStatusEnum} from '@/generated/api';
import {
    Button,
    Card,
    Modal,
    Pagination,
    Table,
    TableColumnConfig,
    Text,
    TextInput,
    withTableSorting,
} from '@gravity-ui/uikit';
import {InputField} from '@/components/formik/InputField';
import {Box} from '@/components/Layout/Box';
import RoleRequestDecisionModal from '@/components/modals/RoleRequestDecisionModal';

export interface RoleRequestsTableProps {
    onEdit: (roleRequestId: string) => void;
    onDelete: (roleRequestId: string) => void;
}

export const RoleRequestsTable: React.FC<RoleRequestsTableProps> = ({onEdit, onDelete}) => {
    const [roleRequests, setRoleRequests] = useState<RoleRequestDTO[]>([]);
    const [statusFilter, setStatusFilter] = useState<RoleRequestDTOStatusEnum | ''>('');
    const [roleIdFilter, setRoleIdFilter] = useState<string>('');
    const [accountIdFilter, setAccountIdFilter] = useState<string>('');
    const [ownerIdFilter, setOwnerIdFilter] = useState<string>('');
    const [limit] = useState<number>(100);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedRoleRequest, setSelectedRoleRequest] = useState<RoleRequestDTO | null>(null);
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
    const [roleOptions, setRoleOptions] = useState<RoleDTO[]>([]);
    const [searchRole, setSearchRole] = useState<string | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    useEffect(() => {
        const fetchRoleRequests = async () => {
            try {
                const response = await rolesRequestsApi.getAllRolesRequests({
                    status: statusFilter || undefined,
                    accountId: accountIdFilter || undefined,
                    ownerId: ownerIdFilter || undefined,
                    roleId: roleIdFilter || undefined,
                    limit,
                    offset,
                });
                setRoleRequests(response.data.data ?? []);
                setTotal(response.data.totalCount ?? 0);
            } catch (error) {
                console.error('Error fetching role requests:', error);
            }
        };

        fetchRoleRequests();
    }, [statusFilter, roleIdFilter, accountIdFilter, ownerIdFilter, limit, offset]);

    const handlePageChange = (page: number, pageSize: number) => {
        setOffset((page - 1) * pageSize);
    };

    const handleOpenAccountsModal = () => {
        setSearchAccount('');
        setIsAccountsModalOpen(true);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const handleOpenRoleModal = () => {
        setSearchRole('');
        setIsRoleModalOpen(true);
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
    };

    const handleAccountChange = (value: string) => {
        setSearchAccount(value);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        setAccountIdFilter(data.id ?? '');
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
    };

    const handleRoleChange = (value: string) => {
        setSearchRole(value);
    };

    const handleRoleSelect = (data: RoleDTO) => {
        setIsRoleModalOpen(false);
        setRoleIdFilter(data.id ?? '');
        setSearchRole(data.name);
    };

    const fetchAccountOptions = async () => {
        const response = await accountsApi.getAllAccounts({
            search: searchAccount ?? '',
            limit: 10,
        });
        setAccountOptions(response.data.data ?? []);
    };

    const fetchRoleOptions = async () => {
        const response = await rolesApi.getAllRoles({
            search: searchRole ?? '',
            limit: 10,
        });
        setRoleOptions(response.data.data ?? []);
    };

    const handleOrderRole = (roleRequest: RoleRequestDTO) => {
        setSelectedRoleRequest(roleRequest);
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
    };

    const columns: TableColumnConfig<RoleRequestDTO>[] = [
        {
            id: 'id',
            name: 'ID',
            template: (roleRequest) => roleRequest.id,
            meta: {
                sort: true,
            },
        },
        {
            id: 'status',
            name: 'Статус',
            template: (roleRequest) => roleRequest.status,
            meta: {
                sort: true,
            },
        },
        {
            id: 'accountId',
            name: 'Аккаунт',
            template: (roleRequest) => roleRequest.accountId,
            meta: {
                sort: true,
            },
        },
        {
            id: 'ownerId',
            name: 'Владелец',
            template: (roleRequest) => roleRequest.ownerId,
            meta: {
                sort: true,
            },
        },
        {
            id: 'roleId',
            name: 'Роль',
            template: (roleRequest) => roleRequest.roleId,
            meta: {
                sort: true,
            },
        },
        {
            id: 'reason',
            name: 'Причина',
            template: (roleRequest) => roleRequest.reason,
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (roleRequest) => (
                <div style={{display: 'flex', gap: '10px'}}>
                    <Button view="normal" size="m" onClick={() => handleOrderRole(roleRequest)}>
                        Принять решение
                    </Button>
                    <Button view="normal" size="m" onClick={() => onEdit(roleRequest.id ?? '???')}>
                        Редактировать
                    </Button>
                    <Button
                        view="normal"
                        size="m"
                        onClick={() => onDelete(roleRequest.id ?? '???')}
                    >
                        Удалить
                    </Button>
                </div>
            ),
        },
    ];

    const MyTable = withTableSorting(Table);

    return (
        <div style={{padding: '20px'}}>
            <div style={{marginBottom: '20px'}}>
                <InputField
                    label="Статус"
                    name="status"
                    value={statusFilter}
                    onChange={(value) => setStatusFilter(value as RoleRequestDTOStatusEnum | '')}
                    placeholder="Выберите статус"
                />
            </div>
            <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Аккаунт</label>
                    <TextInput
                        name="accountId"
                        value={searchAccount ?? ''}
                        onUpdate={handleAccountChange}
                        placeholder="Введите и выберите аккаунт"
                    />
                    <Button view="normal" size="m" onClick={handleOpenAccountsModal}>
                        Поиск аккаунта
                    </Button>
                </div>
            </div>
            <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Роль</label>
                    <TextInput
                        name="roleId"
                        value={searchRole ?? ''}
                        onUpdate={handleRoleChange}
                        placeholder="Введите и выберите роль"
                    />
                    <Button view="normal" size="m" onClick={handleOpenRoleModal}>
                        Поиск роли
                    </Button>
                </div>
            </div>
            <div style={{marginBottom: '20px'}}>
                <InputField
                    label="Владелец"
                    name="ownerId"
                    value={ownerIdFilter}
                    onChange={(value) => setOwnerIdFilter(value)}
                    placeholder="Введите ID владельца"
                />
            </div>
            <MyTable
                data={roleRequests}
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
            <Modal open={isAccountsModalOpen} onOpenChange={handleCloseAccountsModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">Поиск аккаунта</Text>
                    <Box marginTop="10px">
                        {accountOptions.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => handleAccountSelect(item)}
                                style={{marginBottom: '10px', padding: '16px'}}
                            >
                                <Text variant="header-1">{`${item.firstName} ${item.lastName}`}</Text>
                                <Box>
                                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                        {item.email}
                                    </Text>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Button view="normal" onClick={fetchAccountOptions}>
                        Обновить поиск
                    </Button>
                    <Button view="normal" onClick={handleCloseAccountsModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
            <Modal open={isRoleModalOpen} onOpenChange={handleCloseRoleModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">Поиск роли</Text>
                    <Box marginTop="10px">
                        {roleOptions.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => handleRoleSelect(item)}
                                style={{marginBottom: '10px', padding: '16px'}}
                            >
                                <Text variant="header-1">{item.name}</Text>
                                <Box>
                                    <Text variant="subheader-1" color="secondary" ellipsis={true}>
                                        {item.description}
                                    </Text>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Button view="normal" onClick={fetchRoleOptions}>
                        Обновить поиск
                    </Button>
                    <Button view="normal" onClick={handleCloseRoleModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
            <Modal open={isModalVisible} onOpenChange={handleModalCancel}>
                <div>
                    {selectedRoleRequest && (
                        <RoleRequestDecisionModal
                            roleRequest={selectedRoleRequest}
                            onCancel={handleModalCancel}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default RoleRequestsTable;
