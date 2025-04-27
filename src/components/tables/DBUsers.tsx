'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Card,
    Checkbox,
    Icon,
    Label,
    Modal,
    Popup,
    Table,
    TableColumnConfig,
    Text,
    withTableSorting,
} from '@gravity-ui/uikit';
import {MongoDatabase, MongoUser} from '@/generated/api-mdb';
import {useAuth} from '@/context/AuthContext';
import {accountsApi} from '@/app/apis';
import {formatDistanceToNow} from 'date-fns';
import {ru} from 'date-fns/locale';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {parseDateArray} from '@/components/tables/DatabasesTable';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {TrashBin} from '@gravity-ui/icons';
import {UserBlock} from '@/components/common/UserBlock';

interface DBUsersTableProps {
    users: MongoUser[];
    databases: MongoDatabase[];
    deleteAction: (userId: string) => void;
}

export const DBUsersTable: React.FC<DBUsersTableProps> = ({users, databases, deleteAction}) => {
    const {user: userMe, checkPermission} = useAuth();
    const [showDeleted, setShowDeleted] = useState<boolean>(false);
    const [userCache, setUserCache] = useState<{[key: string]: string}>({});
    const [permissionCache, setPermissionCache] = useState<{[key: string]: string}>({});
    const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);
    const [popupContent, setPopupContent] = useState<string>('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

    // Загружаем и кэшируем данные пользователей
    const fetchUsers = async () => {
        const userIds = new Set<string>();
        // users.forEach((user) => {
        //     if (user.createdBy) userIds.add(user.createdBy);
        //     if (user.deletedBy) userIds.add(user.deletedBy);
        // });

        const userPromises = Array.from(userIds).map(async (userId) => {
            try {
                const userResponse = await accountsApi.getAccountById({accountId: userId});
                return {id: userId, name: userResponse.data.username};
            } catch (error) {
                console.error(`Error fetching user with id ${userId}:`, error);
                return {id: userId, name: 'Неизвестный пользователь'};
            }
        });

        const usersData = await Promise.all(userPromises);
        const userMap: {[key: string]: string} = {};
        usersData.forEach((user) => {
            userMap[user.id] = user.name;
        });
        setUserCache(userMap);
    };

    useEffect(() => {
        fetchUsers();
    }, [users]);

    // Загружаем и кэшируем данные разрешений
    const fetchPermissions = async () => {
        const permissionIds = new Set<string>();
        // users.forEach((user) => {
        //     user.permissions.forEach((permission) => {
        //         if (permission.createdBy) permissionIds.add(permission.createdBy);
        //         if (permission.deletedBy) permissionIds.add(permission.deletedBy);
        //     });
        // });

        const permissionPromises = Array.from(permissionIds).map(async (permissionId) => {
            try {
                const permissionResponse = await accountsApi.getAccountById({
                    accountId: permissionId,
                });
                return {id: permissionId, name: permissionResponse.data.username};
            } catch (error) {
                console.error(`Error fetching permission user with id ${permissionId}:`, error);
                return {id: permissionId, name: 'Неизвестный пользователь'};
            }
        });

        const permissionsData = await Promise.all(permissionPromises);
        const permissionMap: {[key: string]: string} = {};
        permissionsData.forEach((permission) => {
            permissionMap[permission.id] = permission.name;
        });
        setPermissionCache(permissionMap);
    };

    useEffect(() => {
        fetchPermissions();
    }, [users]);

    const handleShowDeletedChange = (checked: boolean) => {
        setShowDeleted(checked);
    };

    const handleTogglePopup = (event: React.MouseEvent<HTMLElement>, content: string) => {
        event.stopPropagation();
        setPopupAnchor(event.currentTarget);
        setPopupContent(content);
    };

    const handleClosePopup = () => {
        setPopupAnchor(null);
        setPopupContent('');
    };

    const handleOpenDeleteModal = (userId: string) => {
        setDeletingUserId(userId);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setDeletingUserId(null);
        setIsDeleteModalOpen(false);
    };

    console.log('userCache', userCache);
    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<MongoUser>[] = [
        // {
        //     id: 'id',
        //     name: 'ID',
        //     template: (user) => <TextWithCopy text={user.id} maxLength={8} />,
        // },
        {
            id: 'name',
            name: 'Имя пользователя',
            meta: {
                sort: true,
            },
        },
        {
            id: 'createdAt',
            name: 'Дата создания',
            meta: {
                sort: true,
            },
            template: (user) => (
                <Text variant="subheader-1" color="secondary">
                    {parseDateArray(user.createdAt).toLocaleString()}
                </Text>
            ),
        },
        {
            id: 'createdBy',
            name: 'Создано',
            meta: {
                sort: true,
            },
            template: (_) => userMe?.account && <UserBlock account={userMe?.account} size="m" />,
            // <Text variant="subheader-1" color="secondary">
            //             {(userMe?.account.id && userCache[userMe?.account.id]) || 'Загрузка...'}
            //         </Text>
        },
        {
            id: 'permissions',
            name: 'Разрешения',
            template: (user) => (
                <div>
                    {user.permissions.map((permission) => (
                        <Card key={permission.id} style={{padding: '2px'}}>
                            <VerticalStack>
                                <Text variant="subheader-1" color="secondary">
                                    База данных:{' '}
                                    {databases.find((p) => p.id === permission.databaseId)?.name ??
                                        permission.databaseId}
                                </Text>
                                <Text variant="subheader-1" color="secondary">
                                    Роли: {permission.roles.join(', ')}
                                </Text>
                                {permission.isDeleted && (
                                    <Label theme="warning">
                                        Удалено{' '}
                                        {formatDistanceToNow(new Date(permission.deletedAt), {
                                            locale: ru,
                                            addSuffix: true,
                                        })}
                                        <Button
                                            view="flat"
                                            size="xs"
                                            onClick={(event) =>
                                                handleTogglePopup(
                                                    event,
                                                    `Удалено ${new Date(permission.deletedAt).toLocaleString()} пользователем ${permissionCache[permission.deletedBy] || 'Загрузка...'}`,
                                                )
                                            }
                                        >
                                            <Text variant="body-1" color="secondary">
                                                Подробнее
                                            </Text>
                                        </Button>
                                    </Label>
                                )}
                            </VerticalStack>
                        </Card>
                    ))}
                </div>
            ),
        },
        {
            id: 'status',
            name: 'Статус',
            template: (user) => (
                <HorizontalStack gap={10}>
                    {user.isDeleted && (
                        <Label theme="warning">
                            Удалён{' '}
                            {formatDistanceToNow(new Date(user.deletedAt), {
                                locale: ru,
                                addSuffix: true,
                            })}
                            <Button
                                view="flat"
                                size="xs"
                                onClick={(event) =>
                                    handleTogglePopup(
                                        event,
                                        `Удалён ${new Date(user.deletedAt).toLocaleString()} пользователем ${userCache[user.deletedBy] || 'Загрузка...'}`,
                                    )
                                }
                            >
                                <Text variant="body-1" color="secondary">
                                    Подробнее
                                </Text>
                            </Button>
                        </Label>
                    )}
                </HorizontalStack>
            ),
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (user) => (
                <HorizontalStack gap={10}>
                    {checkPermission('user', 'delete', user.id) && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => handleOpenDeleteModal(user.id)}
                        >
                            <Icon data={TrashBin} />
                            Удалить
                        </Button>
                    )}
                </HorizontalStack>
            ),
        },
    ];

    const filteredUsers = users.filter((user) => !user.isDeleted || showDeleted);

    return (
        <div>
            <HorizontalStack gap={10}>
                <Checkbox size="l" checked={showDeleted} onUpdate={handleShowDeletedChange}>
                    Показывать удалённых пользователей
                </Checkbox>
            </HorizontalStack>
            <div style={{marginTop: '20px'}}>
                <MyTable
                    width="max"
                    data={filteredUsers}
                    // @ts-ignore
                    columns={columns}
                />
            </div>
            <Popup
                anchorElement={popupAnchor}
                open={Boolean(popupAnchor)}
                placement="bottom"
                onOpenChange={handleClosePopup}
            >
                <div style={{padding: '10px', maxWidth: '300px', margin: '0 auto'}}>
                    <Text variant="subheader-1">{popupContent}</Text>
                </div>
            </Popup>
            <Modal open={isDeleteModalOpen} onOpenChange={handleCloseDeleteModal}>
                {deletingUserId && (
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Подтверждение удаления пользователя</Text>
                        <Box marginTop="20px">
                            <Text variant="subheader-1">
                                Вы уверены, что хотите удалить пользователя{' '}
                                {userCache[deletingUserId] || 'Загрузка...'}?
                            </Text>
                        </Box>
                        <Box marginTop="20px">
                            <HorizontalStack gap={20}>
                                <Button
                                    view="outlined-danger"
                                    size="m"
                                    onClick={() => deleteAction(deletingUserId)}
                                >
                                    Удалить
                                </Button>
                                <Button view="normal" size="m" onClick={handleCloseDeleteModal}>
                                    Отмена
                                </Button>
                            </HorizontalStack>
                        </Box>
                    </div>
                )}
            </Modal>
        </div>
    );
};
