'use client';

import {Toaster, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import {AuthProvider} from '@/context/AuthContext';
import React from "react";
import {MyThemeContextProvider} from "@/context/ThemeContext";

export const DARK = 'dark';
export const LIGHT = 'light';
export const DEFAULT_BODY_CLASSNAME = `g-root g-root_theme_${LIGHT}`;

export function ClientProviders({children}: { children: React.ReactNode }) {
    const toaster = new Toaster();

    return (
        <MyThemeContextProvider>
            <ToasterProvider toaster={toaster}>
                <AuthProvider>
                    {children}
                    <ToasterComponent/>
                </AuthProvider>
            </ToasterProvider>
        </MyThemeContextProvider>
    );
}