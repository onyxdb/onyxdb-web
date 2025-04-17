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
import {
    V1ManagedMongoDbApi,
    V1ProjectsApi,
    V1ResourcePresetsApi,
    V1ZonesApi,
} from '@/generated/api-mdb';
import apiClient from '@/auth/apiClient';

const configIDM = new Configuration({
    basePath: '/idm', // Используем прокси в Next.js
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

const configMDB = new Configuration({
    basePath: '/mdb', // Используем прокси в Next.js
    baseOptions: {
        headers: {
            'Content-Type': 'application/json',
        },
    },
});

export const authApi = new AuthApi(configIDM, '', apiClient);
export const accountsApi = new AccountsApi(configIDM, '', apiClient);
export const businessRolesApi = new BusinessRolesApi(configIDM, '', apiClient);
export const domainComponentsApi = new DomainComponentsApi(configIDM, '', apiClient);
export const organizationUnitsApi = new OrganizationUnitsApi(configIDM, '', apiClient);
export const permissionsApi = new PermissionsApi(configIDM, '', apiClient);
export const productsApi = new ProductsApi(configIDM, '', apiClient);
export const rolesApi = new RolesApi(configIDM, '', apiClient);
export const rolesRequestsApi = new RolesRequestsApi(configIDM, '', apiClient);

export const mdbProjectsApi = new V1ProjectsApi(configMDB, '', apiClient);
export const mdbResourcePresetsApi = new V1ResourcePresetsApi(configMDB, '', apiClient);
export const mdbZonesApi = new V1ZonesApi(configMDB, '', apiClient);
export const mdbManagedMongoDbApi = new V1ManagedMongoDbApi(configMDB, '', apiClient);
