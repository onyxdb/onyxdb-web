'use client';

import React, {Suspense, useContext, useEffect, useState} from 'react';
import {
    AbbrApi,
    Boxes3,
    BranchesRight,
    CircleQuestion,
    Database,
    Ghost,
    ListCheck,
    LockOpen,
    Moon,
    PersonMagnifier,
    PersonWorker,
    Persons,
    Sun,
} from '@gravity-ui/icons';
import {AsideHeader, FooterItem} from '@gravity-ui/navigation';
import {LoginInfo} from '@/components/Login/LoginInfo';
import {usePathname, useRouter} from 'next/navigation';
import {MyLoader} from '@/components/Loader';
import MyThemeContext from "@/context/ThemeContext";


export const menuItems = [
    {
        title: 'Аккаунты',
        icon: PersonMagnifier,
        myLink: '/accounts',
    },
    {
        title: 'Оргструктура',
        icon: Persons,
        myLink: '/structure',
    },
    {
        title: 'Доступы',
        icon: LockOpen,
        myLink: '/access',
    },
    {
        title: 'Бизнес Роли',
        icon: PersonWorker,
        myLink: '/business-roles',
    },
    {
        title: 'Запросы',
        icon: ListCheck,
        myLink: '/requests',
    },
    {
        title: 'Продукты',
        icon: BranchesRight,
        myLink: '/products',
    },
    {
        title: 'Проекты',
        icon: Boxes3,
        myLink: '/projects',
    },
    {
        title: 'Кластеры',
        icon: Database,
        myLink: '/clusters',
    },
];

export function AsideComp({children}: { children: React.ReactNode }) {
    const [asideCollapsed, setAsideCollapsed] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<string | undefined>(undefined);
    // const theme = localStorage.getItem('theme') || 'dark';
    const pathname = usePathname();
    const router = useRouter();
    const themeCtx: { isDarkTheme: boolean; toggleThemeHandler: () => void } =
        useContext(MyThemeContext);

    function toggleThemeHandler(): void {
        themeCtx.toggleThemeHandler();
    }

    useEffect(() => {
        if (pathname) {
            const tab = menuItems.find((m) => m.myLink && pathname.startsWith(m.myLink))?.title;
            setActiveTab(tab);
        }
    }, [pathname, menuItems]);

    return (
        <Suspense fallback={<MyLoader/>}>
            <AsideHeader
                headerDecoration={true}
                compact={asideCollapsed ?? false}
                onChangeCompact={setAsideCollapsed}
                // logo={{icon: Ghost, text: 'OnyxDB'}}
                logo={{icon: Ghost, text: 'DBaaS platform'}}
                menuItems={menuItems.map((mi) => ({
                    id: mi.title,
                    current: activeTab === mi.title,
                    title: mi.title,
                    icon: mi.icon,
                    onItemClick: () => router.push(mi.myLink),
                }))}
                renderFooter={(data: { compact: boolean }) => {
                    return (
                        <>
                            <FooterItem
                                compact={data.compact}
                                item={{
                                    id: 'login',
                                    title: <LoginInfo/>,
                                }}
                            />
                            <FooterItem
                                compact={data.compact}
                                item={{
                                    id: 'ambient_mode',
                                    title: `Mode: ${themeCtx.isDarkTheme ? 'dark' : 'light'}`,
                                    icon: themeCtx.isDarkTheme ? Moon : Sun,
                                    link: '#',
                                    onItemClick: toggleThemeHandler,
                                }}
                            />
                            <FooterItem
                                compact={data.compact}
                                item={{
                                    id: 'about',
                                    title: 'GitHub',
                                    link: '/https://github.com/onyxdb/onyxdb-web',
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
    );
}