import React from 'react';
import {Label} from '@gravity-ui/uikit';

interface StatusLabelProps {
    status: string;
}

export const StatusLabel: React.FC<StatusLabelProps> = ({status}) => {
    const statusToThemeMap: {
        [key: string]:
            | 'normal'
            | 'info'
            | 'danger'
            | 'warning'
            | 'success'
            | 'utility'
            | 'unknown'
            | 'clear';
    } = {
        alive: 'success',
        scheduled: 'info',
        in_progress: 'warning',
        error: 'danger',
        success: 'success',
        unknown: 'unknown',
        clear: 'clear',
        normal: 'normal',
    };

    const theme = statusToThemeMap[status] || 'unknown';

    return <Label theme={theme}>{status}</Label>;
};
