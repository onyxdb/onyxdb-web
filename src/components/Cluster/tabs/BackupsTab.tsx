'use client';

import React, {useEffect, useState} from 'react';
import {Button} from '@gravity-ui/uikit';
import {MongoBackup} from '@/generated/api';
import {BackupsTable} from '@/components/tables/BackupsTable';
import {ConfirmationModal} from '@/components/ConfirmationModal';
import {mdbMongoDbBackupsApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {SelectRequestInterval} from '@/components/SelectRequestInterval';

interface BackupsTabProps {
    clusterId: string;
}

const BackupsTab: React.FC<BackupsTabProps> = ({clusterId}) => {
    const [backups, setBackups] = useState<MongoBackup[]>([]);
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<number>(3);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState<boolean>(false);
    const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const backupsResponse = await mdbMongoDbBackupsApi.listBackups({clusterId});
            setBackups(backupsResponse.data.backups);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching backups:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clusterId]);

    useEffect(() => {
        if (isMonitoring) {
            const interval = setInterval(fetchData, selectedInterval * 1000);
            setMonitoringInterval(interval);
            return () => {
                clearInterval(interval);
                setMonitoringInterval(null);
            };
        }
        return () => {
            if (monitoringInterval) {
                clearInterval(monitoringInterval);
                setMonitoringInterval(null);
            }
        };
    }, [isMonitoring, selectedInterval, clusterId]);

    const handleToggleMonitoring = () => {
        setIsMonitoring(!isMonitoring);
    };

    const handleIntervalChange = (value: string[]) => {
        setSelectedInterval(parseInt(value[0], 10));
    };

    const handleCreateBackup = () => {
        mdbMongoDbBackupsApi
            .createBackup({clusterId})
            .then(() => {
                fetchData();
                setIsCreateModalOpen(false);
            })
            .catch((error) => console.error('Error creating backup:', error));
    };

    const handleDeleteBackup = (backupName: string) => {
        mdbMongoDbBackupsApi
            .deleteBackup({clusterId, backupName})
            .then(() => {
                fetchData();
            })
            .catch((error) => console.error('Error deleting backup:', error));
    };

    const handleRestoreBackup = (backupName: string) => {
        mdbMongoDbBackupsApi
            .restoreFromBackup({clusterId, backupName})
            .then(() => {
                fetchData();
            })
            .catch((error) => console.error('Error restoring backup:', error));
    };

    const handleOpenCreateModal = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleOpenDeleteModal = (backupName: string) => {
        setSelectedBackup(backupName);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setSelectedBackup(null);
        setIsDeleteModalOpen(false);
    };

    const handleOpenRestoreModal = (backupName: string) => {
        setSelectedBackup(backupName);
        setIsRestoreModalOpen(true);
    };

    const handleCloseRestoreModal = () => {
        setSelectedBackup(null);
        setIsRestoreModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (selectedBackup) {
            handleDeleteBackup(selectedBackup);
            handleCloseDeleteModal();
        }
    };

    const handleConfirmRestore = () => {
        if (selectedBackup) {
            handleRestoreBackup(selectedBackup);
            handleCloseRestoreModal();
        }
    };

    return (
        <div>
            <SelectRequestInterval
                lastUpdate={lastUpdate}
                isMonitoring={isMonitoring}
                selectedInterval={selectedInterval}
                handleToggleMonitoring={handleToggleMonitoring}
                handleIntervalChange={handleIntervalChange}
            />
            <Box marginTop="20px">
                <Button view="action" size="m" onClick={handleOpenCreateModal}>
                    Создать бекап
                </Button>
            </Box>
            <Box marginTop="20px">
                <BackupsTable
                    clusterId={clusterId}
                    backups={backups}
                    deleteAction={handleOpenDeleteModal}
                    restoreAction={handleOpenRestoreModal}
                />
            </Box>
            <ConfirmationModal
                open={isRestoreModalOpen}
                closeAction={handleCloseRestoreModal}
                confirmAction={handleConfirmRestore}
                title="Подтверждение восстановления бекапа"
                message={`Вы уверены, что хотите восстановить бекап ${selectedBackup} в текущую базу данных?`}
                confirmButtonText="Восстановить"
            />
            <ConfirmationModal
                open={isCreateModalOpen}
                closeAction={handleCloseCreateModal}
                confirmAction={handleCreateBackup}
                title="Подтверждение создания бекапа"
                message={`Вы уверены, что хотите создать новый бекап?`}
                confirmButtonText="Создать"
            />
            <ConfirmationModal
                open={isDeleteModalOpen}
                closeAction={handleCloseDeleteModal}
                confirmAction={handleConfirmDelete}
                title="Подтверждение удаления бекапа"
                message={`Вы уверены, что хотите полностью удалить бекап ${selectedBackup}?`}
                confirmButtonText="Удалить"
            />
        </div>
    );
};

export default BackupsTab;
