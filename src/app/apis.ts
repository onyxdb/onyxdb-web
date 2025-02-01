import {
    AccountsApi,
    BusinessRolesApi,
    DomainComponentsApi,
    OrganizationUnitsApi,
    PermissionsApi,
    ProjectsApi,
} from '@/generated/api';

export const accountsApi = new AccountsApi();
export const businessRolesApi = new BusinessRolesApi();
export const domainComponentsApi = new DomainComponentsApi();
export const organizationUnitsApi = new OrganizationUnitsApi();
export const permissionsApi = new PermissionsApi();
export const projectsApi = new ProjectsApi();
