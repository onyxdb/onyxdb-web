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
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {Loader, ThemeProvider} from '@gravity-ui/uikit';
import useCookie, {booleanCookie, stringCookie} from '@/hooks/useCookie';
import {LoginInfo} from '@/components/Login/LoginInfo';
import {usePathname} from 'next/navigation';

interface AppProps {
    children: React.ReactNode;
}

function useIsSystemDark() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDark(mediaQuery.matches);

            const handleChange = (event: MediaQueryListEvent) => {
                setIsDark(event.matches);
            };

            mediaQuery.addEventListener('change', handleChange);

            return () => {
                mediaQuery.removeEventListener('change', handleChange);
            };
        }
        return () => {};
    }, []);

    return isDark;
}

export const App: React.FC<AppProps> = ({children}) => {
    const isSystemDark = useIsSystemDark();

    const [theme, setTheme] = useCookie<'system' | 'dark' | 'light'>(
        'ambient_mode',
        stringCookie<'system' | 'dark' | 'light'>('system'),
    );
    const [asideCollapsed, setAsideCollapsed] = useCookie('aside_collapsed', booleanCookie(false));

    const isDarkMode = theme === 'dark' || (theme === 'system' && isSystemDark);

    const menuItems = [
        {
            // id: 'accounts',
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
            // id: 'access',
            title: 'Доступы',
            icon: ListCheck,
            link: '/access',
        },
        {
            // id: 'products',
            title: 'Продукты',
            icon: Cpu,
            link: '/products',
        },
    ];

    const pathname = usePathname();
    const [activeTab, setActiveTab] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (pathname) {
            const tab = menuItems.find((m) => m.link && pathname.startsWith(m.link))?.title;
            setActiveTab(tab);
        }
    }, [pathname, menuItems]);

    return (
        <ThemeProvider theme={theme ?? 'system'}>
            <Suspense fallback={<Loader />}>
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
                                                    return setTheme(
                                                        isSystemDark ? 'dark' : 'system',
                                                    );
                                                case 'dark':
                                                    return setTheme(
                                                        isSystemDark ? 'system' : 'light',
                                                    );
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
            </Suspense>
        </ThemeProvider>
    );
};
