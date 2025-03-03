'use client';

import React, {useEffect, useState} from 'react';
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
import {ThemeProvider} from '@gravity-ui/uikit';
import useCookie, {booleanCookie, stringCookie} from '@/hooks/useCookie';
import {LoginInfo} from '@/components/Login/LoginInfo';

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
        // ];

        // Элементы для нижней части сайдбара
        // const secondaryItems: AsideHeaderProps['secondaryItems'] = [
        // {
        //     id: 'theme',
        //     title: 'Тема',
        //     icon: isDarkMode ? Moon : Sun,
        //     onItemClick: toggleTheme, // Смена темы
        // },
        // {
        //     // id: 'support',
        //     title: 'Поддержка',
        //     icon: Comment,
        //     onItemClick: () => window.open('https://t.me/your_support_chat', '_blank'), // Открыть чат поддержки
        // },
        // {
        //     // id: 'user',
        //     title: 'Учётная запись',
        //     icon: Person,
        //     onItemClick: () => router.push('/user'), // Переход на /user
        // },
    ];

    const activeTab = menuItems.find((m) => m.link && location.pathname.startsWith(m.link))?.title;

    return (
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
                                    onItemClickCapture: (e) => {
                                        e.preventDefault();
                                        switch (theme) {
                                            case 'light':
                                                return setTheme(isSystemDark ? 'dark' : 'system');
                                            case 'dark':
                                                return setTheme(isSystemDark ? 'system' : 'light');
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
    );
};
