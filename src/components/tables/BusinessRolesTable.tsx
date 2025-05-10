'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi, businessRolesApi} from '@/app/apis';
import {AccountDTO, BusinessRoleDTO} from '@/generated/api';
import {
    Button,
    Card,
    Icon,
    Modal,
    Pagination,
    Table,
    TableColumnConfig,
    Text,
    TextInput,
    withTableSorting,
} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {Eye, Pencil, TrashBin} from '@gravity-ui/icons';
import BusinessRoleViewModal from '@/components/modals/BusinessRoleViewModal';
import BusinessRoleAssignModal from '@/components/modals/BusinessRoleAssignModal';
import {useAuth} from '@/context/AuthContext';
import {TextWithCopy} from '@/components/TextWithCopy';

export interface BusinessRolesTableProps {
    editAction: (businessRoleId: string) => void;
    deleteAction: (businessRoleId: string, businessRoleName: string) => Promise<void>;
}

export const BusinessRolesTable: React.FC<BusinessRolesTableProps> = ({
    editAction,
    deleteAction,
}) => {
    const [businessRoles, setBusinessRoles] = useState<BusinessRoleDTO[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [limit, setLimit] = useState<number>(10);
    const [offset, setOffset] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [isViewModalVisible, setViewModalVisible] = useState<boolean>(false);
    const [isAssignModalVisible, setAssignModalVisible] = useState<boolean>(false);
    const [selectedBusinessRole, setSelectedBusinessRole] = useState<BusinessRoleDTO | null>(null);
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
    const {checkPermission} = useAuth();

    const fetchBusinessRoles = async () => {
        try {
            const response = await businessRolesApi.getAllBusinessRoles({
                search: searchQuery,
                limit,
                offset,
            });
            console.log('businessRoles response', response.data.data);
            setBusinessRoles(response.data.data ?? []);
            setTotal(response.data.totalCount ?? 0);
        } catch (error) {
            console.error('Error fetching business roles:', error);
        }
    };
    useEffect(() => {
        fetchBusinessRoles();
    }, [searchQuery, limit, offset]);

    const handlePageChange = (page: number, pageSize: number) => {
        setLimit(pageSize);
        setOffset((page - 1) * pageSize);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setOffset(0);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        setIsAccountsModalOpen(false);
        setSelectedBusinessRole((prevRole) => {
            if (prevRole) {
                return {...prevRole, accountId: data.id ?? ''};
            }
            return prevRole;
        });
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
    };

    const fetchAccountOptions = async () => {
        const response = await accountsApi.getAllAccounts({
            search: searchAccount ?? '',
            limit: 10,
        });
        setAccountOptions(response.data.data ?? []);
    };

    const handleViewBusinessRole = (businessRole: BusinessRoleDTO) => {
        setSelectedBusinessRole(businessRole);
        setViewModalVisible(true);
    };

    const handleAssignBusinessRole = (businessRole: BusinessRoleDTO) => {
        setSelectedBusinessRole(businessRole);
        setAssignModalVisible(true);
    };

    const handleViewModalCancel = () => {
        setViewModalVisible(false);
    };

    const handleAssignModalCancel = () => {
        setAssignModalVisible(false);
    };

    const handleDelete = async (businessRoleId: string, businessRoleName: string) => {
        if (!deleteAction) {
            return;
        }
        await deleteAction(businessRoleId, businessRoleName);
        await fetchBusinessRoles();
    };

    const columns: TableColumnConfig<BusinessRoleDTO>[] = [
        {
            id: 'view',
            name: '',
            template: (businessRole) => (
                <Eye
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={() => handleViewBusinessRole(businessRole)}
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
            template: (businessRole) => businessRole.name,
            meta: {
                sort: true,
            },
        },
        {
            id: 'description',
            name: 'Описание',
            template: (businessRole) => businessRole.description,
            meta: {
                sort: true,
            },
        },
        {
            id: 'createdAt',
            name: 'Дата создания',
            template: (businessRole) =>
                businessRole.createdAt
                    ? new Date(businessRole.createdAt).toLocaleString()
                    : 'No data',
            meta: {
                sort: true,
            },
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (businessRole) => (
                <div style={{display: 'flex', gap: '10px'}}>
                    {checkPermission('business-roles', 'assign') && (
                        <Button
                            view="normal"
                            size="m"
                            onClick={() => handleAssignBusinessRole(businessRole)}
                        >
                            Выдать роль
                        </Button>
                    )}
                    {checkPermission('business-roles', 'edit') && (
                        <Button view="normal" size="m" onClick={() => editAction(businessRole.id)}>
                            <Icon data={Pencil} />
                        </Button>
                    )}
                    {checkPermission('business-roles', 'delete') && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => handleDelete(businessRole.id, businessRole.name)}
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
                    placeholder="Поиск по названию бизнес-роли"
                    value={searchQuery}
                    onUpdate={handleSearch}
                />
            </div>
            <MyTable
                width="max"
                data={businessRoles}
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
            <Modal open={isViewModalVisible} onOpenChange={handleViewModalCancel}>
                <div>
                    {selectedBusinessRole && (
                        <BusinessRoleViewModal
                            businessRole={selectedBusinessRole}
                            onCancel={handleViewModalCancel}
                        />
                    )}
                </div>
            </Modal>
            <Modal open={isAssignModalVisible} onOpenChange={handleAssignModalCancel}>
                <div>
                    {selectedBusinessRole && (
                        <BusinessRoleAssignModal
                            businessRole={selectedBusinessRole}
                            onCancel={handleAssignModalCancel}
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default BusinessRolesTable;
