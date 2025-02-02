'use client';

import React, {useState} from 'react';
import {Comment, Cpu, Ghost, ListCheck, Moon, Person, Persons, Sun} from '@gravity-ui/icons';
import {AsideHeader} from '@gravity-ui/navigation';
import {useRouter} from 'next/navigation';
import {AsideHeaderDefaultProps} from '@gravity-ui/navigation/build/esm/components/AsideHeader/types';
import {Theme, ThemeProvider} from '@gravity-ui/uikit';

interface AppProps {
    children: React.ReactNode;
}

const DARK = 'dark';
const LIGHT = 'light';
const DEFAULT_THEME = DARK;

export const App: React.FC<AppProps> = ({children}) => {
    const router = useRouter();
    const [isCompact, setIsCompact] = useState<boolean>(false);
    const [theme, setTheme] = React.useState<Theme>(DEFAULT_THEME);

    const toggleTheme = () => {
        setTheme(theme === LIGHT ? DARK : LIGHT);
    };

    const items: AsideHeaderDefaultProps['menuItems'] = [
        {
            id: 'accounts',
            title: 'Аккаунты',
            icon: Persons,
            onItemClick: () => router.push('/accounts'), // Переход на /accounts
        },
        {
            id: 'access',
            title: 'Доступы',
            icon: ListCheck,
            onItemClick: () => router.push('/access'), // Переход на /access
        },
        {
            id: 'products',
            title: 'Продукты',
            icon: Cpu,
            onItemClick: () => router.push('/products'), // Переход на /products
        },
        // ];

        // Элементы для нижней части сайдбара
        // const secondaryItems: AsideHeaderProps['secondaryItems'] = [
        {
            id: 'theme',
            title: 'Тема',
            icon: theme === LIGHT ? Sun : Moon,
            onItemClick: toggleTheme, // Смена темы
        },
        {
            id: 'support',
            title: 'Поддержка',
            icon: Comment,
            onItemClick: () => window.open('https://t.me/your_support_chat', '_blank'), // Открыть чат поддержки
        },
        {
            id: 'user',
            title: 'Учётная запись',
            icon: Person,
            onItemClick: () => router.push('/user'), // Переход на /user
        },
    ];

    // const pitems: AsideHeaderDefaultProps['panelItems'] = [
    //     {
    //         id: 'user',
    //         visible: true,
    //     },
    // ];

    return (
        <ThemeProvider theme={theme}>
            <AsideHeader
                logo={{icon: Ghost, text: 'OnyxDB'}}
                compact={isCompact}
                hideCollapseButton={false}
                menuItems={items}
                // panelItems={pitems}
                // TODO Как вставить footer?
                onChangeCompact={() => setIsCompact(!isCompact)}
                renderContent={() => children}
            />
        </ThemeProvider>
    );
};
