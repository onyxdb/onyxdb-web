'use client';

import React, {useEffect, useState} from 'react';
import {MongoHostDTO} from '@/generated/api';
import {mdbApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HostsTable} from '@/components/tables/HostsTable';
import {SelectRequestInterval} from '@/components/SelectRequestInterval';

interface HostsTabProps {
    clusterId: string;
}

const HostsTab: React.FC<HostsTabProps> = ({clusterId}) => {
    const [clusterHosts, setClusterHosts] = useState<MongoHostDTO[]>([]);
    const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
    const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [selectedInterval, setSelectedInterval] = useState<number>(3);

    const fetchData = async () => {
        try {
            const hostsResponse = await mdbApi.listHosts({clusterId});
            setClusterHosts(hostsResponse.data.hosts);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching cluster hosts:', error);
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

    return (
        <div>
            <Box marginTop="20px">
                <SelectRequestInterval
                    lastUpdate={lastUpdate}
                    isMonitoring={isMonitoring}
                    selectedInterval={selectedInterval}
                    handleToggleMonitoring={handleToggleMonitoring}
                    handleIntervalChange={handleIntervalChange}
                />
                <HostsTable hosts={clusterHosts} />
            </Box>
        </div>
    );
};

export default HostsTab;
