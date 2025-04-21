'use client';

import React, {Suspense, useEffect, useState} from 'react';
import {
    AbbrApi,
    CircleQuestion,
    Cpu,
    Ghost,
    ListCheck,
    ListUl,
    Moon,
    Persons,
    Sun,
} from '@gravity-ui/icons';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {ThemeProvider, Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import {LoginInfo} from '@/components/Login/LoginInfo';
import {usePathname, useRouter} from 'next/navigation';
import {AuthProvider} from '@/context/AuthContext';
import {MyLoader} from '@/components/Loader';

interface AppProps {
    children: React.ReactNode;
}

export const App: React.FC<AppProps> = ({children}) => {
    const [asideCollapsed, setAsideCollapsed] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
    const [theme, setTheme] = useState<'dark' | 'light'>('light');
    // const theme = localStorage.getItem('theme') || 'dark';
    const isDarkMode = theme === 'dark';
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        {
            title: 'Аккаунты',
            icon: Persons,
            onItemClick: () => router.push('/accounts'),
            myLink: '/accounts',
        },
        {
            title: 'Оргструктура',
            icon: Persons,
            onItemClick: () => router.push('/structure'),
            myLink: '/structure',
        },
        {
            title: 'Доступы',
            icon: ListUl,
            onItemClick: () => router.push('/access'),
            myLink: '/access',
        },
        {
            title: 'Бизнес Роли',
            icon: ListUl,
            onItemClick: () => router.push('/business-roles'),
            myLink: '/business-roles',
        },
        {
            title: 'Запросы',
            icon: ListCheck,
            onItemClick: () => router.push('/requests'),
            myLink: '/requests',
        },
        {
            title: 'Продукты',
            icon: Cpu,
            onItemClick: () => router.push('/products'),
            myLink: '/products',
        },
        {
            title: 'Проекты',
            icon: Cpu,
            onItemClick: () => router.push('/projects'),
            myLink: '/projects',
        },
        {
            title: 'Кластеры',
            icon: Cpu,
            onItemClick: () => router.push('/clusters'),
            myLink: '/clusters',
        },
    ];

    useEffect(() => {
        if (pathname) {
            const tab = menuItems.find((m) => m.myLink && pathname.startsWith(m.myLink))?.title;
            setActiveTab(tab);
        }
    }, [pathname, menuItems]);

    const toaster = new Toaster();

    return (
        <ThemeProvider theme={theme ?? 'system'}>
            <AuthProvider>
                <ToasterProvider toaster={toaster}>
                    {/*<Suspense fallback={<AsideFallback />}>*/}
                    <Suspense fallback={<MyLoader />}>
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
                                                            return setTheme(
                                                                isDarkMode ? 'light' : 'dark',
                                                            );
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
                    </Suspense>
                    <ToasterComponent />
                </ToasterProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};
