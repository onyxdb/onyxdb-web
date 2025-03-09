import type {Metadata} from 'next';
import {DEFAULT_BODY_CLASSNAME} from '@/components/Wrapper';
import {App} from '@/components/App';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import '../styles/globals.css';
import React from 'react';

export const metadata: Metadata = {
    title: 'OnyxDB',
    description: 'Web',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
    return (
        <html lang="en">
            <body className={DEFAULT_BODY_CLASSNAME}>
                <App>{children}</App>
            </body>
        </html>
    );
}
