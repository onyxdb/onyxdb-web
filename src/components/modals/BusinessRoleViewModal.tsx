'use client';

import React, {useEffect, useState} from 'react';
import {businessRolesApi, rolesApi} from '@/app/apis';
import {BusinessRoleDTO, RoleDTO, RoleWithPermissionsDTO} from '@/generated/api';
import {Button, Card, Label, Text} from '@gravity-ui/uikit';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

export interface BusinessRoleViewModalProps {
    businessRole: BusinessRoleDTO;
    onCancel: () => void;
}

export const BusinessRoleViewModal: React.FC<BusinessRoleViewModalProps> = ({
    businessRole,
    onCancel,
}) => {
    const [rolesWithPermissions, setRolesWithPermissions] = useState<RoleWithPermissionsDTO[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rolesResponse = await businessRolesApi.getRolesByBusinessRoleId({
                    businessRoleId: businessRole.id ?? '',
                });

                const permissionsPromises = rolesResponse.data.map((role) =>
                    rolesApi.getPermissionsByRoleId({roleId: role.id ?? ''}),
                );
                const permissionsResponses = await Promise.all(permissionsPromises);
                setRolesWithPermissions(permissionsResponses.flatMap((response) => response.data));
            } catch (error) {
                console.error('Error fetching data for business role:', error);
            }
        };

        fetchData();
    }, [businessRole]);

    function getLinkedResource(role: RoleDTO) {
        if (role.productId) {
            return (
                <Text variant="subheader-1">
                    {role.shopName}: Продукт <Label theme="info">{role.productId}</Label>
                </Text>
            );
        }
        if (role.orgUnitId) {
            return (
                <Text variant="subheader-1">
                    {role.shopName}: Организация <Label theme="info">{role.orgUnitId}</Label>
                </Text>
            );
        }
        return (
            <Text variant="subheader-1">
                {role.shopName}: <Label theme="info">Глобальная</Label>
            </Text>
        );
    }

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <Text variant="header-2">
                Просмотр бизнес-роли: <Label theme="info">{businessRole.name}</Label>
            </Text>
            <div style={{marginBottom: '20px', marginTop: '20px'}}>
                <Text variant="header-1">Информация о бизнес-роли</Text>
                <Card style={{padding: '16px', marginBottom: '10px'}}>
                    <Text variant="subheader-2">Описание:</Text>
                    <Text variant="subheader-1" color="secondary">
                        {businessRole.description}
                    </Text>
                </Card>
                <Card style={{padding: '16px', marginBottom: '10px'}}>
                    <Text variant="subheader-2">Роли:</Text>
                    {rolesWithPermissions.map((role) => (
                        <Card style={{padding: '16px', marginBottom: '10px'}} key={role.role.id}>
                            {getLinkedResource(role.role)}
                            <ul>
                                {role.permissions.map((permission) => (
                                    <li key={permission.id}>
                                        <Text variant="subheader-1" color="secondary">
                                            {permission.resourceType ?? 'Global'}:{' '}
                                            {permission.actionType}
                                        </Text>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    ))}
                </Card>
                {/*<Card style={{padding: '16px', marginBottom: '10px'}}>*/}
                {/*    <Text variant="subheader-2">Разрешения:</Text>*/}
                {/*    <ul>*/}
                {/*        {rolesWithPermissions.map((roleWP) => (*/}
                {/*            roleWP.permissions.map((permission) => (*/}
                {/*                <li key={permission.id}>*/}
                {/*                    <Text variant="subheader-1" color="secondary">*/}
                {/*                        {roleWP.role.}: {permission.resourceType}: {permission.actionType}*/}
                {/*                    </Text>*/}
                {/*                </li>*/}
                {/*            )),*/}
                {/*        ))}*/}
                {/*    </ul>*/}
                {/*</Card>*/}
            </div>
            <HorizontalStack>
                <Button view="normal" size="l" onClick={onCancel}>
                    Назад
                </Button>
            </HorizontalStack>
        </div>
    );
};

export default BusinessRoleViewModal;
