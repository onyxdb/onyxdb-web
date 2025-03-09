'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi, rolesApi, rolesRequestsApi} from '@/app/apis';
import {AccountDTO, RoleDTO, RoleRequestDTO, RoleRequestDTOStatusEnum} from '@/generated/api';
import {
    Button,
    Card,
    Modal,
    Pagination,
    Select,
    Table,
    TableColumnConfig,
    Text,
    TextInput,
    withTableSorting,
} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import RoleRequestDecisionModal from '@/components/modals/RoleRequestDecisionModal';
import {usePermissions} from '@/hooks/usePermissions';

export interface RoleRequestsTableProps {}

export const RoleRequestsTable: React.FC<RoleRequestsTableProps> = () => {
    const [roleRequests, setRoleRequests] = useState<RoleRequestDTO[]>([]);

    const [statusFilter, setStatusFilter] = useState<string>('');
    const [roleIdFilter, setRoleIdFilter] = useState<string>('');
    const [accountIdFilter, setAccountIdFilter] = useState<string>('');
    const [ownerIdFilter, setOwnerIdFilter] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
    const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

    const [selectedRoleRequest, setSelectedRoleRequest] = useState<RoleRequestDTO | null>(null);
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [searchOwner, setSearchOwner] = useState<string | null>(null);
    const [roleOptions, setRoleOptions] = useState<RoleDTO[]>([]);
    const [searchRole, setSearchRole] = useState<string | null>(null);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const {checkActions} = usePermissions();

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

    useEffect(() => {
        fetchRoleRequests();
    }, [statusFilter, roleIdFilter, accountIdFilter, ownerIdFilter, limit, offset]);

    const fetchAccountOptions = async (query: string) => {
        const response = await accountsApi.getAllAccounts({
            search: query ?? '',
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

    const handlePageChange = (page: number, pageSize: number) => {
        setLimit(pageSize);
        setOffset((page - 1) * pageSize);
    };

    const handleOpenAccountsModal = () => {
        fetchAccountOptions(searchAccount ?? '');
        setIsAccountsModalOpen(true);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const handleOpenOwnerModal = () => {
        fetchAccountOptions(searchOwner ?? '');
        setIsOwnerModalOpen(true);
    };

    const handleCloseOwnerModal = () => {
        setIsOwnerModalOpen(false);
    };

    const handleOpenRoleModal = () => {
        fetchRoleOptions();
        setIsRoleModalOpen(true);
    };

    const handleCloseRoleModal = () => {
        setIsRoleModalOpen(false);
    };

    const handleAccountChange = (value: string) => {
        if (value.length === 0) {
            setAccountIdFilter('');
        }
        setSearchAccount(value);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        setAccountIdFilter(data.id ?? '');
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
    };

    const handleOwnerChange = (value: string) => {
        if (value.length === 0) {
            setOwnerIdFilter('');
        }
        setSearchOwner(value);
    };

    const handleOwnerAccountSelect = (data: AccountDTO) => {
        setIsOwnerModalOpen(false);
        setOwnerIdFilter(data.id ?? '');
        setSearchOwner(`${data.firstName} ${data.lastName} (${data.email})`);
    };

    const handleRoleChange = (value: string) => {
        if (value.length === 0) {
            setRoleIdFilter('');
        }
        setSearchRole(value);
    };

    const handleRoleSelect = (data: RoleDTO) => {
        setIsRoleModalOpen(false);
        setRoleIdFilter(data.id ?? '');
        setSearchRole(data.name);
    };

    const handleOrderRole = (roleRequest: RoleRequestDTO) => {
        setSelectedRoleRequest(roleRequest);
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        fetchRoleRequests();
    };

    const statusOptions = [
        {value: '', content: 'Все статусы'},
        {value: RoleRequestDTOStatusEnum.Waiting, content: 'Ожидание'},
        {value: RoleRequestDTOStatusEnum.Approved, content: 'Утверждена'},
        {value: RoleRequestDTOStatusEnum.Declined, content: 'Отклонена'},
    ];

    const columns: TableColumnConfig<RoleRequestDTO>[] = [
        {
            id: 'roleId',
            name: 'Роль',
            template: (roleRequest) => roleRequest.roleId,
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
            template: (roleRequest) =>
                roleRequest.status === 'WAITING' &&
                checkActions([
                    {name: 'admin', action: ''},
                    {name: 'web-global-role-request', action: 'edit'},
                    //     TODO: Либо текущий человек овнер
                ]) && (
                    <div style={{display: 'flex', gap: '10px'}}>
                        <Button view="normal" size="m" onClick={() => handleOrderRole(roleRequest)}>
                            Принять решение
                        </Button>
                    </div>
                ),
        },
    ];

    const MyTable = withTableSorting(Table);

    return (
        <div style={{padding: '20px'}}>
            <h1>Заявки на доступы</h1>
            <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Статус заявки</label>
                    <Select onUpdate={(value) => setStatusFilter(value[0])} options={statusOptions}>
                        {/*{statusOptions.map((option) => (*/}
                        {/*    <Select.Option key={option.value} value={option.value}>*/}
                        {/*        {option.content}*/}
                        {/*    </Select.Option>*/}
                        {/*))}*/}
                    </Select>
                </div>
            </div>
            <div style={{marginBottom: '20px'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Получатель</label>
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
                    <label style={{display: 'block', marginBottom: '8px'}}>Владелец</label>
                    <TextInput
                        name="ownerId"
                        value={searchOwner ?? ''}
                        onUpdate={handleOwnerChange}
                        placeholder="Введите и выберите владельца"
                    />
                    <Button view="normal" size="m" onClick={handleOpenOwnerModal}>
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
                    pageSizeOptions={[5, 10, 20, 100]}
                    total={total}
                    onUpdate={handlePageChange}
                />
            </div>
            <Modal open={isAccountsModalOpen} onOpenChange={handleCloseAccountsModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">Поиск аккаунта получателя</Text>
                    <Box marginTop="10px">
                        {accountOptions.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => {
                                    handleAccountSelect(item);
                                }}
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
                    <Button view="normal" onClick={handleCloseAccountsModal}>
                        Закрыть
                    </Button>
                </div>
            </Modal>
            <Modal open={isOwnerModalOpen} onOpenChange={handleCloseOwnerModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <Text variant="header-1">Поиск аккаунта владельца</Text>
                    <Box marginTop="10px">
                        {accountOptions.map((item) => (
                            <Card
                                key={item.id}
                                type="selection"
                                onClick={() => {
                                    handleOwnerAccountSelect(item);
                                }}
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
                    <Button view="normal" onClick={handleCloseOwnerModal}>
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
