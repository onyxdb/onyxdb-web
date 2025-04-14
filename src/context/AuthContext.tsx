import React, {createContext, useContext, useEffect, useState} from 'react';
import {getCurrentUser} from '@/auth/authService';
import {AccountDTO} from '@/generated/api';

interface Permissions {
    [key: string]: {[key: string]: object} | null;
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
    checkPermission: (name: string, action?: string) => boolean;
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
                setUser({account: userData.account, permissions: userData.permissions});
                setPermissions(userData.permissions);
            } catch {
                setUser(null);
                setPermissions({});
            }
        };

        fetchUser();
    }, []);

    function checkActions(actions: Action[]) {
        // console.log(
        //     'checkActions',
        //     permissions,
        //     'res 1',
        //     permissions['global-any'] !== undefined || permissions['web-any'] !== undefined,
        //     'res 2',
        //     Boolean(permissions[name] !== undefined || permissions[`${name}-${action}`] !== undefined),
        // );
        if (permissions['global-any'] !== undefined || permissions['web-any'] !== undefined) {
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

    function checkPermission(name: string, action?: string) {
        // console.log(
        //     'checkPermission',
        //     permissions,
        //     'res 1',
        //     permissions['global-any'] !== undefined || permissions['web-any'] !== undefined,
        //     'res 2',
        //     Boolean(permissions[name] !== undefined || permissions[`${name}-${action}`] !== undefined),
        // );
        if (permissions['global-any'] !== undefined || permissions['web-any'] !== undefined) {
            return true;
        }
        return Boolean(
            permissions[name] !== undefined || permissions[`${name}-${action}`] !== undefined,
        );
    }

    return (
        <AuthContext.Provider value={{user, setUser, permissions, checkActions, checkPermission}}>
            {children}
        </AuthContext.Provider>
    );
};
