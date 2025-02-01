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

export const businessRolesApi = new BusinessRolesApi();
export const domainComponentsApi = new DomainComponentsApi();
export const organizationUnitsApi = new OrganizationUnitsApi();
export const permissionsApi = new PermissionsApi();
export const projectsApi = new ProjectsApi();
