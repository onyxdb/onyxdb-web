import {
    AccountsApi,
    AuthApi,
    BusinessRolesApi,
    Configuration,
    DomainComponentsApi,
    OrganizationUnitsApi,
    PermissionsApi,
    ProductsApi,
    RolesApi,
    RolesRequestsApi,
} from '@/generated/api';
import {V1ClustersApi, V1ProjectsApi} from '@/generated/api-mdb';

const config = new Configuration({
    basePath: '', // Используем прокси в Next.js
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

export const authApi = new AuthApi(config);
export const accountsApi = new AccountsApi(config);
export const businessRolesApi = new BusinessRolesApi(config);
export const domainComponentsApi = new DomainComponentsApi(config);
export const organizationUnitsApi = new OrganizationUnitsApi(config);
export const permissionsApi = new PermissionsApi(config);
export const productsApi = new ProductsApi(config);
export const rolesApi = new RolesApi(config);
export const rolesRequestsApi = new RolesRequestsApi(config);

export const mdbProjectsApi = new V1ProjectsApi(config);
export const mdbClustersApi = new V1ClustersApi(config);
