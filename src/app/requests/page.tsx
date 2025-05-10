'use client';

import React, {useEffect, useState} from 'react';
import {rolesRequestsApi} from '@/app/apis';
import {
    AccountDTO,
    RoleDTO,
    RoleRequestFullDTO,
    RoleRequestFullDTOStatusEnum,
} from '@/generated/api';
import {
    Button,
    Modal,
    Pagination,
    Select,
    Table,
    TableColumnConfig,
    Text,
    withTableSorting,
} from '@gravity-ui/uikit';
import RoleRequestDecisionModal from '@/components/modals/RoleRequestDecisionModal';
import {useAuth} from '@/context/AuthContext';
import {TextWithCopy} from '@/components/TextWithCopy';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {AccountSelector} from '@/components/AccountSelector';
import {RoleSelector} from '@/components/RoleSelector';
import {StatusLabel} from '@/components/common/StatusLabel';
import {UserBlock} from '@/components/common/UserBlock';

export default function RoleRequestsTable() {
    const [roleRequests, setRoleRequests] = useState<RoleRequestFullDTO[]>([]);

    const [statusFilter, setStatusFilter] = useState<string>('');
    const [receiverFilter, setReceiverFilter] = useState<AccountDTO | null>(null);
    const [ownerFilter, setOwnerFilter] = useState<AccountDTO | null>(null);
    const [roleIdFilter, setRoleIdFilter] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedRoleRequest, setSelectedRoleRequest] = useState<RoleRequestFullDTO | null>(null);

    const {checkPermission, user} = useAuth();

    const fetchRoleRequests = async () => {
        try {
            const response = await rolesRequestsApi.getAllRolesRequests({
                status: statusFilter || undefined,
                accountId: receiverFilter?.id,
                ownerId: ownerFilter?.id,
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
    }, [statusFilter, roleIdFilter, receiverFilter, ownerFilter, limit, offset]);

    const handlePageChange = (page: number, pageSize: number) => {
        setLimit(pageSize);
        setOffset((page - 1) * pageSize);
    };

    const handleOrderRole = (roleRequest: RoleRequestFullDTO) => {
        setSelectedRoleRequest(roleRequest);
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        fetchRoleRequests();
    };

    const columns: TableColumnConfig<RoleRequestFullDTO>[] = [
        {
            id: 'id',
            name: 'Id',
            template: (item) => <TextWithCopy text={item.id} maxLength={8} />,
        },
        {
            id: 'role',
            name: 'Роль',
            template: (item) => <Text>{item.role?.shopName ?? 'No data'}</Text>,
        },
        {
            id: 'status',
            name: 'Статус',
            template: (roleRequest) => <StatusLabel status={roleRequest.status.toLowerCase()} />,
            meta: {
                sort: true,
            },
        },
        {
            id: 'account',
            name: 'Аккаунт',
            template: (item) =>
                item.account ? <UserBlock account={item.account} size="s" /> : 'No data',
        },
        {
            id: 'owner',
            name: 'Владелец',
            template: (item) =>
                item.owner ? <UserBlock account={item.owner} size="s" /> : 'No data',
        },
        {
            id: 'reason',
            name: 'Причина',
            template: (roleRequest) => roleRequest.reason,
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (roleRequest) =>
                roleRequest.status === 'WAITING' &&
                (checkPermission('role-request', 'edit') ||
                    (user && user?.account.id === roleRequest.owner?.id)) && (
                    <div style={{display: 'flex', gap: '10px'}}>
                        <Button view="normal" size="m" onClick={() => handleOrderRole(roleRequest)}>
                            Принять решение
                        </Button>
                    </div>
                ),
        },
    ];

    const handleReceiverSelect = (account: AccountDTO | null) => {
        setReceiverFilter(account);
    };

    const handleOwnerSelect = (account: AccountDTO | null) => {
        setOwnerFilter(account);
    };

    const handleRoleSelect = (role: RoleDTO | null) => {
        setRoleIdFilter(role?.id ?? '');
    };

    const MyTable = withTableSorting(Table);

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/access', text: 'Доступы'},
        {href: '/requests', text: 'Запросы'},
    ];

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={[]} />
            <div style={{padding: '20px'}}>
                <div style={{width: '500px'}}>
                    <AccountSelector
                        selectAccountAction={handleReceiverSelect}
                        label="Получатель"
                        header="Выберите получателя для фильтрации"
                    />
                </div>
                <div style={{width: '500px'}}>
                    <AccountSelector
                        selectAccountAction={handleOwnerSelect}
                        label="Владелец"
                        header="Выберите получателя для фильтрации"
                    />
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <div style={{width: '365px'}}>
                        <RoleSelector
                            selectRoleAction={handleRoleSelect}
                            label="Роль"
                            header="Выберите роль для фильтрации"
                        />
                    </div>
                    <div>
                        <label style={{display: 'block', marginBottom: '8px'}}>Статус заявки</label>
                        <Select
                            onUpdate={(value) => setStatusFilter(value[0])}
                            defaultValue={['']}
                            options={[
                                {value: '', content: 'Все статусы'},
                                {value: RoleRequestFullDTOStatusEnum.Waiting, content: 'Ожидание'},
                                {
                                    value: RoleRequestFullDTOStatusEnum.Approved,
                                    content: 'Утверждена',
                                },
                                {
                                    value: RoleRequestFullDTOStatusEnum.Declined,
                                    content: 'Отклонена',
                                },
                            ]}
                        />
                    </div>
                </div>
                <MyTable
                    width="max"
                    data={roleRequests}
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
        </div>
    );
}
