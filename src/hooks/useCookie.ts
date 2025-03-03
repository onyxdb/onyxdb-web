import {useEffect, useState} from 'react';

type UseCookieOptions<T> = {
    initial?: T | null;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
};

export function stringCookie<T extends string>(initial: T): UseCookieOptions<T> {
    return {
        initial: initial,
        serialize: (x) => x,
        deserialize: (x) => x as T,
    };
}

export function booleanCookie(initial: boolean): UseCookieOptions<boolean> {
    return {
        initial: initial,
        serialize: (value: boolean) => value.toString(),
        deserialize: (value: string) => value === 'true',
    };
}

export function useCookie<T = string>(
    key: string,
    options: UseCookieOptions<T> = {},
): [T | null, (value: T | null) => void] {
    const {initial = null, serialize = JSON.stringify, deserialize = JSON.parse} = options;

    const [value, setValue] = useState<T | null>(() => {
        const cookieValue = document.cookie.split('; ').find((row) => row.startsWith(`${key}=`));
        if (cookieValue) {
            return deserialize(cookieValue.split('=')[1]);
        }
        return initial;
    });

    useEffect(() => {
        if (value === null) {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        } else {
            document.cookie = `${key}=${serialize(value)}; path=/`;
        }
    }, [key, value, serialize]);

    const setCookie = (newValue: T | null) => {
        setValue(newValue);
    };

    return [value, setCookie];
}

export default useCookie;
