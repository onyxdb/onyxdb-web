'use client';

import React from 'react';

interface GrafanaFrameProps {
    dashboardId: string;
}

const GrafanaFrame: React.FC<GrafanaFrameProps> = ({dashboardId}) => {
    return (
        <div>
            <iframe
                src={`http://localhost:51610/d/${dashboardId}`}
                // src="http://<grafana-service>:3000/d/<dashboard-uid>"
                width="100%"
                height="600px"
                frameBorder="0"
            />
        </div>
    );
};

export default GrafanaFrame;
