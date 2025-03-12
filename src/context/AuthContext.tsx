import React, {createContext, useContext, useEffect, useState} from 'react';
import {getCurrentUser} from '@/auth/authService';

interface Permissions {
    [key: string]: string[];
}

interface User {
    account: {
        username: string;
    };
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
        for (const action of actions) {
            if (permissions[action.name] || permissions[`${action.name}-${action.action}`]) {
                return true;
            }
        }
        return false;
    }

    function checkPermission(name: string, action?: string) {
        return Boolean(permissions[name] || permissions[`${name}-${action}`]);
    }

    return (
        <AuthContext.Provider value={{user, setUser, permissions, checkActions, checkPermission}}>
            {children}
        </AuthContext.Provider>
    );
};
