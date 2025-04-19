'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Checkbox,
    Label,
    Popup,
    Table,
    TableColumnConfig,
    Text,
    withTableSorting,
} from '@gravity-ui/uikit';
import {MongoDatabase} from '@/generated/api-mdb';
import {useAuth} from '@/context/AuthContext';
import {accountsApi} from '@/app/apis';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {AccountDTO} from '@/generated/api';
import {UserBlock} from '@/components/common/UserBlock';

interface DatabasesTableProps {
    databases: MongoDatabase[];
    deleteAction: (databaseId: string) => void;
}

export const DatabasesTable: React.FC<DatabasesTableProps> = ({databases, deleteAction}) => {
    const {checkPermission} = useAuth();
    const [showDeleted, setShowDeleted] = useState<boolean>(false);
    const [userCache, setUserCache] = useState<{[key: string]: AccountDTO | null}>({});
    const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);
    const [popupContent, setPopupContent] = useState<string>('');

    useEffect(() => {
        // Загружаем и кэшируем данные пользователей
        const fetchUsers = async () => {
            const userIds = new Set<string>();
            databases.forEach((db) => {
                if (db.createdBy) userIds.add(db.createdBy);
                if (db.deletedBy) userIds.add(db.deletedBy);
            });

            console.log('userIds:', userIds);
            const userPromises = Array.from(userIds).map(async (userId) => {
                try {
                    const userResponse = await accountsApi.getAccountById({accountId: userId});
                    return {id: userId, user: userResponse.data};
                } catch (error) {
                    console.error(`Error fetching user with id ${userId}:`, error);
                    return {id: userId, user: null};
                }
            });

            const users = await Promise.all(userPromises);
            const userMap: {[key: string]: AccountDTO | null} = {};
            users.forEach((user) => {
                userMap[user.id] = user.user;
            });
            setUserCache(userMap);
        };

        fetchUsers();
    }, [databases]);

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

    const MyTable = withTableSorting(Table);
    const columns: TableColumnConfig<MongoDatabase>[] = [
        {
            id: 'name',
            name: 'Название',
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
            template: (database) => (
                <Text variant="subheader-1" color="secondary">
                    {new Date(database.createdAt).toLocaleString()}
                </Text>
            ),
        },
        {
            id: 'createdBy',
            name: 'Создано',
            meta: {
                sort: true,
            },
            template: (database) => (
                <Text variant="subheader-1" color="secondary">
                    {userCache[database.createdBy] === null ? (
                        'Неизвестно'
                    ) : (
                        <UserBlock
                            // @ts-ignore
                            account={userCache[database.createdBy]}
                        />
                    )}
                </Text>
            ),
        },
        {
            id: 'status',
            name: 'Статус',
            template: (database) => (
                <HorizontalStack gap={10}>
                    {database.isDeleted && (
                        <Label theme="warning">
                            Удалена
                            <Button
                                view="flat"
                                size="xs"
                                onClick={(event) =>
                                    handleTogglePopup(
                                        event,
                                        `Удалена ${new Date(database.deletedAt).toLocaleString()} пользователем ${userCache[database.deletedBy] || 'Загрузка...'}`,
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
            template: (database) => (
                <HorizontalStack gap={10}>
                    {checkPermission('database', 'delete', database.id) && !database.isDeleted && (
                        <Button view="outlined" size="m" onClick={() => deleteAction(database.id)}>
                            Удалить
                        </Button>
                    )}
                </HorizontalStack>
            ),
        },
    ];

    const filteredDatabases = databases.filter((db) => !db.isDeleted || showDeleted);

    return (
        <div>
            <HorizontalStack gap={10}>
                <Checkbox size="l" checked={showDeleted} onUpdate={handleShowDeletedChange}>
                    Показывать удалённые базы данных
                </Checkbox>
            </HorizontalStack>
            <Box marginTop="20px">
                <MyTable
                    width="max"
                    data={filteredDatabases}
                    // @ts-ignore
                    columns={columns}
                />
            </Box>
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
        </div>
    );
};
