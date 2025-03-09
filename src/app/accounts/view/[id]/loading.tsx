'use client';

import React from 'react';
import {Loader} from '@gravity-ui/uikit';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

export default function Loading() {
    return (
        <HorizontalStack align="center" justify="center">
            <Loader />
        </HorizontalStack>
    );
}
