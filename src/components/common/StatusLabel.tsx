import React from 'react';
import {Label} from '@gravity-ui/uikit';
import {capitalizeFirstLetter} from '@/utils/utils';

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
        approved: 'success',
        scheduled: 'info',
        waiting: 'warning',
        in_progress: 'warning',
        declined: 'danger',
        error: 'danger',
        success: 'success',
        unknown: 'unknown',
        clear: 'clear',
        normal: 'normal',
    };

    const theme = statusToThemeMap[status] || 'unknown';

    return <Label theme={theme}>{capitalizeFirstLetter(status.toLowerCase())}</Label>;
};
