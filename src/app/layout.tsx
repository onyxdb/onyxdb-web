import type {Metadata} from 'next';

import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';
import '../styles/globals.css';
import React from 'react';
import {ClientProviders, DEFAULT_BODY_CLASSNAME} from '@/app/ClientProviders';
// import {getRootClassName} from '@gravity-ui/uikit/server';

export const metadata: Metadata = {
    // title: 'OnyxDB',
    title: 'DBaaS platform',
    description: 'Web',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
    // const rootClassName = getRootClassName({theme: 'light'});

    return (
        <html lang="en">
            <body className={DEFAULT_BODY_CLASSNAME}>
                {/*<div className={rootClassName}>*/}

                <ClientProviders>
                    {/*<App>*/}
                    {children}
                    {/*</App>*/}
                </ClientProviders>
                {/*</div>*/}
            </body>
        </html>
    );
}

//
// export default function RootLayout({children}: {children: React.ReactNode}) {
//     const theme = DARK; // Можно динамически определять тему через cookies
//     const rootClassName = getRootClassName({theme});
//
//     return (
//         <html lang="en">
//         <body>
//         <div className={rootClassName}>
//             <App theme={theme}>{children}</App>
//         </div>
//         </body>
//         </html>
//     );
// }
