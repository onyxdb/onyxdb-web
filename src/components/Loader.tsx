import {Loader} from '@gravity-ui/uikit';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import React from 'react';

export const MyLoader: React.FC = () => {
    return (
        <HorizontalStack align="center" justify="center">
            <Loader size="l" />
        </HorizontalStack>
    );
};
