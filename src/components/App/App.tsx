'use client';

import React, {Suspense, useEffect, useState} from 'react';
import {
    AbbrApi,
    CircleQuestion,
    Cpu,
    Ghost,
    ListCheck,
    Moon,
    Persons,
    Sun,
} from '@gravity-ui/icons';
import {AsideFallback, AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {ThemeProvider} from '@gravity-ui/uikit';
import {LoginInfo} from '@/components/Login/LoginInfo';
import {usePathname} from 'next/navigation';

interface AppProps {
    children: React.ReactNode;
}

const menuItems = [
    {
        title: 'Аккаунты',
        icon: Persons,
        link: '/accounts',
    },
    {
        title: 'Оргструктура',
        icon: Persons,
        link: '/structure',
    },
    {
        title: 'Доступы',
        icon: ListCheck,
        link: '/access',
    },
    {
        title: 'Продукты',
        icon: Cpu,
        link: '/products',
    },
];

export const App: React.FC<AppProps> = ({children}) => {
    const [asideCollapsed, setAsideCollapsed] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const isDarkMode = theme === 'dark';
    const pathname = usePathname();

    useEffect(() => {
        if (pathname) {
            const tab = menuItems.find((m) => m.link && pathname.startsWith(m.link))?.title;
            setActiveTab(tab);
        }
    }, [pathname, menuItems]);

    return (
        <Suspense fallback={<AsideFallback />}>
            <ThemeProvider theme={theme ?? 'system'}>
                <AsideHeader
                    headerDecoration={true}
                    compact={asideCollapsed ?? false}
                    onChangeCompact={setAsideCollapsed}
                    logo={{icon: Ghost, text: 'OnyxDB'}}
                    menuItems={menuItems.map((mi) => ({
                        ...mi,
                        id: mi.title,
                        current: activeTab === mi.title,
                    }))}
                    renderFooter={(data: {compact: boolean}) => {
                        return (
                            <>
                                <FooterItem
                                    compact={data.compact}
                                    item={{
                                        id: 'login',
                                        title: <LoginInfo />,
                                    }}
                                />
                                <FooterItem
                                    compact={data.compact}
                                    item={{
                                        id: 'ambient_mode',
                                        title: `Mode: ${theme}`,
                                        icon: isDarkMode ? Moon : Sun,
                                        link: '#',
                                        onItemClick: () => {
                                            switch (theme) {
                                                case 'light':
                                                    return setTheme('dark');
                                                case 'dark':
                                                    return setTheme('light');
                                                default:
                                                    return setTheme(isDarkMode ? 'light' : 'dark');
                                            }
                                        },
                                    }}
                                />
                                <FooterItem
                                    compact={data.compact}
                                    item={{
                                        id: 'about',
                                        title: 'About',
                                        link: '/about',
                                        icon: CircleQuestion,
                                    }}
                                />
                                <FooterItem
                                    compact={data.compact}
                                    item={{
                                        id: 'api',
                                        title: 'API',
                                        link: '/api/v1/docs',
                                        icon: AbbrApi,
                                    }}
                                />
                            </>
                        );
                    }}
                    renderContent={() => children}
                />
            </ThemeProvider>
        </Suspense>
    );
};
