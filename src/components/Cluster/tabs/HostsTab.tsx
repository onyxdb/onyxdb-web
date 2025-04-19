'use client';

import React, {useEffect, useState} from 'react';
import {MongoHost} from '@/generated/api-mdb';
import {mdbManagedMongoDbApi} from '@/app/apis';
import {Box} from '@/components/Layout/Box';
import {HostsTable} from '@/components/tables/HostsTable';

interface HostsTabProps {
    clusterId: string;
}

const HostsTab: React.FC<HostsTabProps> = ({clusterId}) => {
    const [clusterHosts, setClusterHosts] = useState<MongoHost[]>([]);

    const fetchData = async () => {
        try {
            const hostsResponse = await mdbManagedMongoDbApi.listHosts({clusterId});
            setClusterHosts(hostsResponse.data.hosts);
        } catch (error) {
            console.error('Error fetching cluster hosts:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [clusterId]);

    return (
        <div>
            <Box marginTop="20px">
                <HostsTable hosts={clusterHosts} />
            </Box>
        </div>
    );
};

export default HostsTab;
