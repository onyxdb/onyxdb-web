'use client';

import React, {useEffect, useState} from 'react';
import {
    Button,
    Checkbox,
    Icon,
    Label,
    Popup,
    Table,
    TableColumnConfig,
    Text,
    withTableSorting,
} from '@gravity-ui/uikit';
import {AccountDTO, MongoDatabaseDTO} from '@/generated/api';
import {useAuth} from '@/context/AuthContext';
import {accountsApi} from '@/app/apis';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {UserBlock} from '@/components/common/UserBlock';
import {TrashBin} from '@gravity-ui/icons';

interface DatabasesTableProps {
    databases: MongoDatabaseDTO[];
    deleteAction: (databaseId: string) => void;
}

export function parseDateArray(dateArray: number[] | string): Date {
    if (typeof dateArray === 'string') {
        return new Date(dateArray);
    }
    // Обратите внимание, что месяц уменьшается на 1, так как в JavaScript месяцы 0-11
    const [year, month, day, hours, minutes, seconds, milliseconds] = dateArray;
    // Делим последнее число на 1e6, если оно включает наносекунды (как 812113000)
    return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds / 1e6);
}

export const DatabasesTable: React.FC<DatabasesTableProps> = ({databases, deleteAction}) => {
    const {user: userMe, checkPermission} = useAuth();
    const [showDeleted, setShowDeleted] = useState<boolean>(false);
    const [userCache, setUserCache] = useState<{[key: string]: AccountDTO | null}>({});
    const [popupAnchor, setPopupAnchor] = useState<HTMLElement | null>(null);
    const [popupContent, setPopupContent] = useState<string>('');

    // Загружаем и кэшируем данные пользователей
    const fetchUsers = async () => {
        const userIds = new Set<string>();
        // databases.forEach((db) => {
        //     if (db.createdBy) userIds.add(db.createdBy);
        //     if (db.deletedBy) userIds.add(db.deletedBy);
        // });

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

    useEffect(() => {
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
    const columns: TableColumnConfig<MongoDatabaseDTO>[] = [
        {
            id: 'name',
            name: 'Название',
            template: (database) => (
                <HorizontalStack gap={10}>
                    <Text variant="subheader-1">{database.name}</Text>
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
                    {parseDateArray(database.createdAt).toLocaleString()}
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
            // template: (database) => (
            //     <Text variant="subheader-1" color="secondary">
            //         {userCache[database.createdBy] === null ? (
            //             'Неизвестно'
            //         ) : (
            //             <UserBlock
            //                 // @ts-ignore
            //                 account={userCache[database.createdBy]}
            //             />
            //         )}
            //     </Text>
            // ),
        },
        {
            id: 'actions',
            name: 'Действия',
            template: (database) => (
                <HorizontalStack gap={10}>
                    {checkPermission('database', 'delete', database.name) &&
                        !database.isDeleted && (
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => deleteAction(database.name)}
                        >
                            <Icon data={TrashBin} />
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
