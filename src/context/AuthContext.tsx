import React, {createContext, useContext, useEffect, useState} from 'react';
import {getCurrentUser} from '@/auth/authService';
import {AccountDTO} from '@/generated/api';
import {useToaster} from '@gravity-ui/uikit';

// interface Permissions {
//     [key: string]: {[key: string]: object} | null;
// }

interface Permissions {
    [key: string]: null;
}

export interface User {
    account: AccountDTO;
    permissions: Permissions;
}

interface Action {
    name: string;
    action?: string;
}

interface AuthContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    permissions: Permissions;
    checkActions: (actions: Action[]) => boolean;
    checkPermission: (entity: string, action?: string, id?: string) => boolean;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    permissions: {},
    checkActions: () => false,
    checkPermission: () => false,
    fetchUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permissions>({});
    const toaster = useToaster();

    const fetchUser = async () => {
        try {
            const userData = await getCurrentUser();
            if (!userData) {
                throw new Error('Error fetching user data');
            }
            console.info('My account data:', userData);

            const filteredPermissions: Permissions = {};
            for (const item in userData.permissions) {
                if (item.startsWith('web-')) {
                    filteredPermissions[item.substring('web-'.length)] = null;
                } else {
                    filteredPermissions[item] = null;
                }
            }

            setUser({account: userData.account, permissions: filteredPermissions});
            setPermissions(filteredPermissions);
        } catch (err) {
            toaster.add({
                name: 'error_get_user_data',
                title: 'Ошибка авторизации',
                content: `Не удалось получить данные пользователя. Попробуйте выполнить перезайти в аккаунт.`,
                theme: 'danger',
            });
            console.error('Error fetching user:', err);
            setUser(null);
            setPermissions({});
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    function checkActions(actions: Action[]) {
        if (permissions['any'] !== undefined) {
            return true;
        }
        for (const action of actions) {
            if (
                permissions[action.name] !== undefined ||
                permissions[`${action.name}-${action.action}`] !== undefined
            ) {
                return true;
            }
        }
        return false;
    }

    function checkPermission(entity: string, action?: string, id?: string) {
        const suitablePermission = [
            'global-any',
            `global-${action}`,
            `${entity}-any`,
            `${entity}-${action}`,
            `${entity}-${action}-any`,
            `${entity}-${action}-${id}`,
        ];
        for (const permission of suitablePermission) {
            if (permissions[permission] !== undefined) {
                return true;
            }
        }
        return false;
    }

    console.log('AuthProvider user=', user)
    return (
        <AuthContext.Provider value={{user, setUser, permissions, checkActions, checkPermission, fetchUser}}>
            {children}
        </AuthContext.Provider>
    );
};
