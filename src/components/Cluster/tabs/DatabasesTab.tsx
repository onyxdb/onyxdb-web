'use client';

import React, {useEffect, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {CreateMongoDatabaseRequestDTO, MongoDatabaseDTO} from '@/generated/api';
import {mdbMongoDbDatabasesApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {DatabasesTable} from '@/components/tables/DatabasesTable';
import {DatabaseForm} from '@/components/forms/DatabaseForm';

interface DatabasesTabProps {
    clusterId: string;
}

const DatabasesTab: React.FC<DatabasesTabProps> = ({clusterId}) => {
    const [databases, setDatabases] = useState<MongoDatabaseDTO[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

    const fetchData = async () => {
        try {
            const databasesResponse = await mdbMongoDbDatabasesApi.listDatabases({clusterId});
            console.log('databases resp', databasesResponse.data.databases);
            setDatabases(databasesResponse.data.databases);
        } catch (error) {
            console.error('Error fetching databases:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clusterId]);

    const handleCreateDatabase = (database: CreateMongoDatabaseRequestDTO) => {
        mdbMongoDbDatabasesApi
            .createDatabase({clusterId, createMongoDatabaseRequestDTO: database})
            .then(() => {
                fetchData();
                setIsCreateModalOpen(false);
            })
            .catch((error) => console.error('Error creating database:', error));
    };

    const handleDeleteDatabase = (databaseName: string) => {
        mdbMongoDbDatabasesApi
            .deleteDatabase({clusterId, databaseName})
            .then(() => {
                fetchData();
            })
            .catch((error) => console.error('Error deleting database:', error));
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    return (
        <div>
            <Box marginTop="20px" marginBottom="20px">
                <Button view="action" size="m" onClick={handleOpenCreateModal}>
                    Создать базу данных
                </Button>
            </Box>
            <DatabasesTable databases={databases} deleteAction={handleDeleteDatabase} />
            {isCreateModalOpen && (
                <DatabaseForm
                    closeAction={handleCloseCreateModal}
                    submitAction={handleCreateDatabase}
                />
            )}
        </div>
    );
};

export default DatabasesTab;
