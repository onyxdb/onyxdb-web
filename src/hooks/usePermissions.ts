import {useEffect, useState} from 'react';

interface Permissions {
    [key: string]: any;
}

export const usePermissions = () => {
    const [permissions, setPermissions] = useState<Permissions>({});

    useEffect(() => {
        setPermissions({
            'web-global-business-roles': {},
            'web-product-123-edit': {},
            'web-product-123-view': {},
        });
        // getMyPermission()
        //     .then((response) => setPermissions(response.data.data ?? {}))
        //     .catch((error) => console.error('Error fetching permissions:', error));
    }, []);

    return {permissions};
};
