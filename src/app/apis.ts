import {
    AccountsApi,
    BusinessRolesApi,
    Configuration,
    DomainComponentsApi,
    OrganizationUnitsApi,
    PermissionsApi,
    ProjectsApi,
} from '@/generated/api';

const config = new Configuration({
    basePath: '', // Оставьте пустым, так как запросы будут идти через прокси
});

export const accountsApi = new AccountsApi(config);
export const businessRolesApi = new BusinessRolesApi(config);
export const domainComponentsApi = new DomainComponentsApi(config);
export const organizationUnitsApi = new OrganizationUnitsApi(config);
export const permissionsApi = new PermissionsApi(config);
export const projectsApi = new ProjectsApi(config);
