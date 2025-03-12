// import {useEffect, useState} from 'react';
// import {useAuth} from '@/context/AuthContext';
//
// interface Permissions {
//     [key: string]: unknown;
// }
//
// interface Action {
//     name: string;
//     action?: string;
// }
//
// export const usePermissions = () => {
//     const {user} = useAuth();
//     const [permissions, setPermissions] = useState<Permissions>({});
//
//     useEffect(() => {
//         if (user?.permissions) {
//             setPermissions(user?.permissions);
//         }
//     }, []);
//
//     function checkActions(actions: Action[]) {
//         for (const action of actions) {
//             if (permissions[action.name] || permissions[`${action.name}-${action.action}`]) {
//                 return true;
//             }
//         }
//         return false;
//     }
//
//     function checkPermission(name: string, action?: string) {
//         return Boolean(permissions[name] || permissions[`${name}-${action}`]);
//     }
//
//     return {permissions, checkActions, checkPermission};
// };
