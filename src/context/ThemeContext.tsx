'use client'

import React, { ReactElement, createContext, useEffect, useState } from "react";
import {ThemeProvider} from "@gravity-ui/uikit";

const MyThemeContext = createContext({
    isDarkTheme: false,
    toggleThemeHandler: () => {},
});

interface ThemePropsInterface {
    children?: React.ReactNode | Array<React.ReactNode>;
}

export function MyThemeContextProvider(
    props: ThemePropsInterface
): ReactElement {
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    useEffect(() => initialThemeHandler());

    function isLocalStorageEmpty(): boolean {
        return !localStorage.getItem("isDarkTheme");
    }

    function initialThemeHandler(): void {
        if (isLocalStorageEmpty()) {
            localStorage.setItem("isDarkTheme", `false`);
            document!.querySelector("body")!.classList.add("light");
            setIsDarkTheme(false);
        } else {
            const isDarkMode: boolean = JSON.parse(
                localStorage.getItem("isDarkTheme")!
            );
            if (isDarkMode) {
                document!.querySelector("body")!.classList.add("dark");
            }
            setIsDarkTheme(() => {
                return isDarkMode;
            });
        }
    }

    function toggleThemeHandler(): void {
        const isDarkMode: boolean = JSON.parse(
            localStorage.getItem("isDarkTheme")!
        );
        setIsDarkTheme(!isDarkMode);
        toggleDarkClassToBody();
        setValueToLocalStorage();
    }

    function toggleDarkClassToBody(): void {
        document!.querySelector("body")!.classList.toggle("dark");
    }

    function setValueToLocalStorage(): void {
        localStorage.setItem("isDarkTheme", `${!isDarkTheme}`);
    }

    return (
        <MyThemeContext.Provider value={{ isDarkTheme: isDarkTheme, toggleThemeHandler }}>
            <ThemeProvider theme={isDarkTheme ? 'dark' : 'light'}>
                {props.children}
            </ThemeProvider>
        </MyThemeContext.Provider>
    );
}

export default MyThemeContext;