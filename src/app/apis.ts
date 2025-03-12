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
import apiClient from '@/auth/apiClient';

const config = new Configuration({
    basePath: '', // Используем прокси в Next.js
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

export const authApi = new AuthApi(config, '', apiClient);
export const accountsApi = new AccountsApi(config, '', apiClient);
export const businessRolesApi = new BusinessRolesApi(config, '', apiClient);
export const domainComponentsApi = new DomainComponentsApi(config, '', apiClient);
export const organizationUnitsApi = new OrganizationUnitsApi(config, '', apiClient);
export const permissionsApi = new PermissionsApi(config, '', apiClient);
export const productsApi = new ProductsApi(config, '', apiClient);
export const rolesApi = new RolesApi(config, '', apiClient);
export const rolesRequestsApi = new RolesRequestsApi(config, '', apiClient);

export const mdbProjectsApi = new V1ProjectsApi(config, '', apiClient);
export const mdbClustersApi = new V1ClustersApi(config, '', apiClient);
