'use client';

import React, {useEffect, useState} from 'react';
import {rolesRequestsApi} from '@/app/apis';
import {AccountDTO, RoleDTO, RoleRequestDTO, RoleRequestDTOStatusEnum} from '@/generated/api';
import {
    Button,
    Modal,
    Pagination,
    Select,
    Table,
    TableColumnConfig,
    withTableSorting,
} from '@gravity-ui/uikit';
import RoleRequestDecisionModal from '@/components/modals/RoleRequestDecisionModal';
import {useAuth} from '@/context/AuthContext';
import {TextWithCopy} from '@/components/TextWithCopy';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {AccountSelector} from '@/components/AccountSelector';
import {RoleSelector} from '@/components/RoleSelector';
import {StatusLabel} from '@/components/common/StatusLabel';

export default function RoleRequestsTable() {
    const [roleRequests, setRoleRequests] = useState<RoleRequestDTO[]>([]);

    const [statusFilter, setStatusFilter] = useState<string>('');
    const [receiverFilter, setReceiverFilter] = useState<AccountDTO | null>(null);
    const [ownerFilter, setOwnerFilter] = useState<AccountDTO | null>(null);
    const [roleIdFilter, setRoleIdFilter] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [selectedRoleRequest, setSelectedRoleRequest] = useState<RoleRequestDTO | null>(null);

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

    const handleOrderRole = (roleRequest: RoleRequestDTO) => {
        setSelectedRoleRequest(roleRequest);
        setModalVisible(true);
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        fetchRoleRequests();
    };

    const columns: TableColumnConfig<RoleRequestDTO>[] = [
        {
            id: 'id',
            name: 'Id',
            template: (item) => <TextWithCopy text={item.id} maxLength={8} />,
        },
        {
            id: 'roleId',
            name: 'Роль',
            template: (item) => <TextWithCopy text={item.roleId} maxLength={8} />,
            meta: {
                sort: true,
            },
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
            id: 'accountId',
            name: 'Аккаунт',
            template: (item) => <TextWithCopy text={item.accountId} maxLength={8} />,
            meta: {
                sort: true,
            },
        },
        {
            id: 'ownerId',
            name: 'Владелец',
            template: (item) =>
                item.ownerId ? <TextWithCopy text={item.ownerId} maxLength={8} /> : 'No data',
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
                (checkPermission('role-request', 'edit') ||
                    user?.account.id === roleRequest.ownerId) && (
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
                                {value: RoleRequestDTOStatusEnum.Waiting, content: 'Ожидание'},
                                {value: RoleRequestDTOStatusEnum.Approved, content: 'Утверждена'},
                                {value: RoleRequestDTOStatusEnum.Declined, content: 'Отклонена'},
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
