// import {InfoButtons} from '../components/InfoButtons';
//
// export default function Home() {
//     return <InfoButtons />;
// }

'use client';

import React from 'react';
import {Icon, Menu, Text} from '@gravity-ui/uikit';
import {usePathname, useRouter} from 'next/navigation';
import {menuItems} from '@/components/App';

export default function () {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div
            style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Text variant="header-1" style={{marginBottom: '40px'}}>
                Меню
            </Text>
            <Menu size="l" style={{width: '100%', maxWidth: '300px'}}>
                {menuItems.map((item) => (
                    <Menu.Item
                        key={item.title}
                        iconStart={<Icon data={item.icon} size={24} />}
                        selected={pathname === item.myLink}
                        onClick={() => router.push(item.myLink)}
                        style={{
                            height: '60px',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            gap: '16px',
                        }}
                    >
                        {item.title}
                    </Menu.Item>
                ))}
            </Menu>
        </div>
    );
}
