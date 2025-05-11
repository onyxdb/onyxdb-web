import React from 'react';
import {Card, Icon, Text} from '@gravity-ui/uikit';
import {Layers, PersonWorker, ShieldKeyhole} from '@gravity-ui/icons';
import {
    AccountRolesAllDTO,
    BusinessRoleDTO,
    BusinessRoleWithRolesDTO,
    PermissionDTO,
    RoleWithPermissionsDTO,
} from '@/generated/api';
import {VerticalStack} from '@/components/Layout/VerticalStack';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

const PermissionBadge: React.FC<{permission: PermissionDTO}> = ({permission}) => {
    return (
        <HorizontalStack align="center" gap={5}>
            <Text variant="code-2" color="primary">
                -&nbsp;{permission.actionType}
            </Text>
            <Text variant="code-1" color="secondary">
                {permission.resourceType || 'GLOBAL'}
            </Text>
            {permission.data && Object.keys(permission.data).length > 0 && (
                <Text variant="caption-1" color="hint">
                    {JSON.stringify(permission.data)}
                </Text>
            )}
        </HorizontalStack>
    );
};

const RoleCard: React.FC<{roleWithPermissions: RoleWithPermissionsDTO}> = ({
    roleWithPermissions,
}) => {
    const {role, permissions} = roleWithPermissions;

    return (
        <Card view="outlined" style={{padding: 12}}>
            <HorizontalStack align="center">
                <Box marginRight={8}>
                    <Icon data={ShieldKeyhole} />
                </Box>
                <Text variant="subheader-2">{role.name}</Text>
                <Text variant="body-2" color="secondary" style={{marginLeft: '16px'}}>
                    {role.roleType}
                </Text>
                <Text variant="body-2" color="secondary" style={{marginLeft: '16px'}}>
                    {role.entity}
                </Text>
            </HorizontalStack>
            <VerticalStack gap={5}>
                {permissions.length > 0 && (
                    <div style={{marginLeft: 24}}>
                        <Text variant="caption-2" color="secondary" style={{marginBottom: 8}}>
                            Разрешения:
                        </Text>
                        <VerticalStack gap={2}>
                            {permissions.map((permission) => (
                                <PermissionBadge key={permission.id} permission={permission} />
                            ))}
                        </VerticalStack>
                    </div>
                )}
            </VerticalStack>
        </Card>
    );
};

const Section: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
    <div style={{marginTop: '8px'}}>
        <Text variant="header-1">{title}</Text>
        <div style={{marginTop: '8px'}}>{children}</div>
    </div>
);

const RolesList: React.FC<{roles: RoleWithPermissionsDTO[]}> = ({roles}) => {
    if (roles.length === 0) {
        return (
            <Text variant="body-1" color="secondary">
                Нет назначенных ролей
            </Text>
        );
    }

    return (
        <VerticalStack gap={5}>
            {roles.map((role) => (
                <RoleCard key={role.role.id} roleWithPermissions={role} />
            ))}
        </VerticalStack>
    );
};

const BusinessRoleCard: React.FC<{
    businessRole: BusinessRoleWithRolesDTO;
    level: number;
}> = ({businessRole, level}) => {
    return (
        <Card view="outlined" style={{padding: 16, marginBottom: 8}}>
            <VerticalStack gap={5}>
                <HorizontalStack align="center">
                    <Box marginRight={8}>
                        <Icon data={level === 0 ? PersonWorker : Layers} />
                    </Box>
                    <Text variant="subheader-2">{businessRole.businessRole.shopName}</Text>
                </HorizontalStack>

                {businessRole.businessRole.description && (
                    <Text variant="body-1" color="secondary">
                        {businessRole.businessRole.description}
                    </Text>
                )}

                {/* Роли в бизнес-роли */}
                {businessRole.roles?.length > 0 && (
                    <div style={{marginTop: 12}}>
                        <Text variant="caption-2" color="secondary" style={{marginBottom: 8}}>
                            Включает роли:
                        </Text>
                        <VerticalStack gap={5}>
                            {businessRole.roles.map((roleWithPerms) => (
                                <RoleCard
                                    key={roleWithPerms.role.id}
                                    roleWithPermissions={roleWithPerms}
                                />
                            ))}
                        </VerticalStack>
                    </div>
                )}
            </VerticalStack>
        </Card>
    );
};

const BusinessRolesHierarchy: React.FC<{
    businessRoles: BusinessRoleWithRolesDTO[];
    allBusinessRoles: BusinessRoleWithRolesDTO[];
    level?: number;
}> = ({businessRoles, allBusinessRoles, level = 0}) => {
    if (businessRoles.length === 0) return null;

    return (
        <VerticalStack gap={5}>
            {businessRoles
                .filter(
                    (obj, index, self) =>
                        index === self.findIndex((t) => t.businessRole.id === obj.businessRole.id),
                )
                .map((businessRole) => (
                    <React.Fragment key={businessRole.businessRole.id}>
                        <div style={{marginLeft: `${30 * level}px`}}>
                            <BusinessRoleCard businessRole={businessRole} level={level} />
                        </div>

                        {/* Рекурсивно отображаем дочерние бизнес-роли */}
                        <BusinessRolesHierarchy
                            businessRoles={allBusinessRoles.filter(
                                (br) => br.businessRole.id === businessRole.businessRole.parentId,
                            )}
                            allBusinessRoles={allBusinessRoles}
                            level={level + 1}
                        />
                    </React.Fragment>
                ))}
        </VerticalStack>
    );
};

export const RolesViewer: React.FC<{
    accountAccess: AccountRolesAllDTO | null;
    accountBusinessRoles: BusinessRoleDTO[];
}> = ({accountAccess, accountBusinessRoles}) => {
    if (!accountAccess) {
        return <Text variant="body-1">Данные не загружены</Text>;
    }

    const brs = accountAccess.businessRoles.filter(
        (br) => accountBusinessRoles.find((p) => p.id === br.businessRole.id) !== undefined,
    );

    return (
        <VerticalStack gap={4}>
            {/* Прямые роли */}
            {accountAccess.roles.length > 0 && (
                <Section title="Прямо назначенные роли">
                    <RolesList roles={accountAccess.roles} />
                </Section>
            )}

            {/* Бизнес роли */}
            {brs.length > 0 && (
                <Section title="Бизнес роли">
                    <BusinessRolesHierarchy
                        businessRoles={brs}
                        allBusinessRoles={accountAccess.businessRoles}
                    />
                </Section>
            )}
        </VerticalStack>
    );
};
