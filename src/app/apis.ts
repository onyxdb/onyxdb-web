import {
    AccountsApi,
    AuthApi,
    BillingApi,
    BusinessRolesApi,
    Configuration,
    DomainComponentsApi,
    MDBApi,
    MDBQuotasApi,
    ManagedMongoDBBackupsApi,
    ManagedMongoDBDatabasesApi,
    ManagedMongoDBUsersApi,
    OperationsApi,
    OrganizationUnitsApi,
    PermissionsApi,
    ProductsApi,
    ProjectsApi,
    ResourcePresetsApi,
    RolesApi,
    RolesRequestsApi,
} from '@/generated/api';
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

export const mdbProjectsApi = new ProjectsApi(configMDB, '', apiClient);
export const mdbResourcePresetsApi = new ResourcePresetsApi(configMDB, '', apiClient);
export const mdbApi = new MDBApi(configMDB, '', apiClient);
export const mdbMongoDbUserApi = new ManagedMongoDBUsersApi(configMDB, '', apiClient);
export const mdbMongoDbDatabasesApi = new ManagedMongoDBDatabasesApi(configMDB, '', apiClient);
export const mdbMongoDbBackupsApi = new ManagedMongoDBBackupsApi(configMDB, '', apiClient);
export const mdbQuotasApi = new MDBQuotasApi(configMDB, '', apiClient);
export const mdbBillingApi = new BillingApi(configMDB, '', apiClient);
export const mdbOperationApi = new OperationsApi(configMDB, '', apiClient);
