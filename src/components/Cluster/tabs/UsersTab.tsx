'use client';

import React, {useEffect, useState} from 'react';
import {Button, Modal} from '@gravity-ui/uikit';
import {MongoDatabase, MongoUser, MongoUserToCreate} from '@/generated/api';
import {Box} from '@/components/Layout/Box';
import {DBUsersTable} from '@/components/tables/DBUsers';
import {DBUserForm} from '@/components/forms/DBUserForm';
import {mdbMongoDbDatabasesApi, mdbMongoDbUserApi} from '@/app/apis';

interface UsersTabProps {
    clusterId: string;
}

const UsersTab: React.FC<UsersTabProps> = ({clusterId}) => {
    const [users, setUsers] = useState<MongoUser[]>([]);
    const [databases, setDatabases] = useState<MongoDatabase[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const fetchDataUsers = async () => {
        try {
            const usersResponse = await mdbMongoDbUserApi.listUsers({clusterId});
            console.log('usersResponse', usersResponse);
            setUsers(usersResponse.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchDataDBs = async () => {
        try {
            const databasesResponse = await mdbMongoDbDatabasesApi.listDatabases({clusterId});
            console.log('databases resp', databasesResponse.data.databases);
            setDatabases(databasesResponse.data.databases);
        } catch (error) {
            console.error('Error fetching databases:', error);
        }
    };

    useEffect(() => {
        fetchDataUsers();
        fetchDataDBs();
    }, [clusterId]);

    const handleCreateUser = (user: MongoUserToCreate) => {
        mdbMongoDbUserApi
            .createUser({clusterId, mongoUserToCreate: user})
            .then(() => {
                fetchDataUsers();
                setIsCreateModalOpen(false);
            })
            .catch((error) => console.error('Error creating user:', error));
    };

    const handleDeleteUser = (userId: string) => {
        mdbMongoDbUserApi
            .deleteUser({userId})
            .then(() => {
                fetchDataUsers();
            })
            .catch((error) => console.error('Error deleting user:', error));
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    return (
        <div>
            <Box marginTop="20px">
                <Button view="action" size="m" onClick={handleOpenCreateModal}>
                    Создать пользователя
                </Button>
            </Box>
            <Box marginTop="20px">
                <DBUsersTable users={users} databases={databases} deleteAction={handleDeleteUser} />
            </Box>
            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                    <DBUserForm
                        clusterId={clusterId}
                        closeAction={handleCloseCreateModal}
                        submitAction={handleCreateUser}
                    />
                </div>
            </Modal>
        </div>
    );
};

export default UsersTab;
