'use client';

import React, {useEffect, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {MongoUser, MongoUserToCreate} from '@/generated/api-mdb';
import {Box} from '@/components/Layout/Box';
import {DBUsersTable} from '@/components/tables/DBUsers';
import {DBUserForm} from '@/components/forms/DBUserForm';
import {mdbMongoDbUserApi} from '@/app/apis';

interface UsersTabProps {
    clusterId: string;
}

const UsersTab: React.FC<UsersTabProps> = ({clusterId}) => {
    const [users, setUsers] = useState<MongoUser[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const fetchData = async () => {
        try {
            const usersResponse = await mdbMongoDbUserApi.listUsers({clusterId});
            setUsers(usersResponse.data.users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clusterId]);

    const handleCreateUser = (user: MongoUserToCreate) => {
        mdbMongoDbUserApi
            .createUser({clusterId, mongoUserToCreate: user})
            .then(() => {
                fetchData();
                setIsCreateModalOpen(false);
            })
            .catch((error) => console.error('Error creating user:', error));
    };

    const handleDeleteUser = (userId: string) => {
        mdbMongoDbUserApi
            .deleteUser({userId})
            .then(() => {
                fetchData();
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
                <DBUsersTable users={users} deleteAction={handleDeleteUser} />
            </Box>
            {isCreateModalOpen && (
                <DBUserForm closeAction={handleCloseCreateModal} submitAction={handleCreateUser} />
            )}
        </div>
    );
};

export default UsersTab;
