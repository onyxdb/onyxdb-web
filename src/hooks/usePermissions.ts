import {useEffect, useState} from 'react';

interface Permissions {
    [key: string]: any;
}

interface Action {
    name: string;
    action?: string;
}

export const usePermissions = () => {
    const [permissions, setPermissions] = useState<Permissions>({});

    useEffect(() => {
        setPermissions({
            'web-global-domain-components-create': {},
            'web-global-domain-components-edit': {},
            'web-global-domain-components-delete': {},
            'web-global-organization-unit-create': {},
            'web-global-organization-unit-edit': {},
            'web-global-organization-unit-delete': {},
            'web-global-business-roles-create': {},
            'web-global-business-roles-edit': {},
            'web-global-business-roles-delete': {},
            'web-global-account-create': {},
            'web-global-account-edit': {},
            'web-global-account-delete': {},
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
