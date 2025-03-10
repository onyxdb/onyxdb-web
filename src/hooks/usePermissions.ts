import {useEffect, useState} from 'react';

interface Permissions {
    [key: string]: unknown;
}

interface Action {
    name: string;
    action?: string;
}

export const usePermissions = () => {
    const [permissions, setPermissions] = useState<Permissions>({});

    useEffect(() => {
        setPermissions({
            'web-global-domain-component-create': {},
            'web-global-domain-component-edit': {},
            'web-global-domain-component-delete': {},
            'web-global-organization-unit-create': {},
            'web-global-organization-unit-edit': {},
            'web-global-organization-unit-delete': {},
            'web-global-business-role-create': {},
            'web-global-business-role-edit': {},
            'web-global-business-role-delete': {},
            'web-global-role-create': {},
            'web-global-role-edit': {},
            'web-global-role-delete': {},
            'web-global-role-request-edit': {},
            'web-global-account-create': {},
            'web-global-account-edit': {},
            'web-global-account-delete': {},
            'web-global-product-create': {},
            'web-global-product-edit': {},
            'web-global-product-delete': {},
            'web-product-123-edit': {},
            'web-product-123-view': {},
        });
        // getMyPermission()
        //     .then((response) => setPermissions(response.data.data ?? {}))
        //     .catch((error) => console.error('Error fetching permissions:', error));
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

    return {permissions, checkActions, checkPermission};
};
