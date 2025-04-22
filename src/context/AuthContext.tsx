import React, {createContext, useContext, useEffect, useState} from 'react';
import {getCurrentUser} from '@/auth/authService';
import {AccountDTO} from '@/generated/api';

// interface Permissions {
//     [key: string]: {[key: string]: object} | null;
// }

interface Permissions {
    [key: string]: null;
}

interface User {
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
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {},
    permissions: {},
    checkActions: () => false,
    checkPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [permissions, setPermissions] = useState<Permissions>({});

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getCurrentUser();
                console.log('My account data:', userData);

                const filteredPermissions: Permissions = {};
                for (const item in userData.permissions) {
                    if (item.startsWith('global-')) {
                        filteredPermissions[item.substring('global-'.length)] = null;
                    } else if (item.startsWith('web-')) {
                        filteredPermissions[item.substring('web-'.length)] = null;
                    }
                }

                setUser({account: userData.account, permissions: filteredPermissions});
                setPermissions(filteredPermissions);
            } catch (err) {
                console.error('Error fetching user:', err);
                setUser(null);
                setPermissions({});
            }
        };

        fetchUser();
    }, []);

    function checkActions(actions: Action[]) {
        if (permissions['any'] !== undefined || permissions['any'] !== undefined) {
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

    function checkPermission(name: string, action?: string, id?: string) {
        const suitablePermission = [
            'any',
            `${name}-any`,
            `${name}-${id}`,
            `${name}-${id}-any`,
            `${name}-${id}-${action}`,
        ];
        for (const permission of suitablePermission) {
            if (permissions[permission] !== undefined) {
                return true;
            }
        }
        return false;
    }

    return (
        <AuthContext.Provider value={{user, setUser, permissions, checkActions, checkPermission}}>
            {children}
        </AuthContext.Provider>
    );
};
