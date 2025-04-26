'use client';

import React from 'react';

interface GrafanaFrameProps {
    dashboardId: string;
}

const GrafanaFrame: React.FC<GrafanaFrameProps> = ({dashboardId}) => {
    const url = `http://localhost:3333/d/${dashboardId}`;
    console.log('GrafanaFrame', url);
    return (
        <div>
            <iframe
                src={url}
                // src="http://<grafana-service>:3000/d/<dashboard-uid>"
                width="100%"
                height="600px"
                frameBorder="0"
            />
        </div>
    );
};

export default GrafanaFrame;
