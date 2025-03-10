// components/RoleRequestDecisionModal.js

'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi, rolesApi, rolesRequestsApi} from '@/app/apis';
import {AccountDTO, RoleDTO, RoleRequestDTO, RoleWithPermissionsDTO} from '@/generated/api';
import {Button, Card, Label, Text} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

export interface RoleRequestDecisionModalProps {
    roleRequest: RoleRequestDTO;
    onCancel: () => void;
}

export const RoleRequestDecisionModal: React.FC<RoleRequestDecisionModalProps> = ({
    roleRequest,
    onCancel,
}) => {
    const [account, setAccount] = useState<AccountDTO | null>(null);
    const [role, setRole] = useState<RoleDTO | null>(null);
    const [roleWithPermissions, setRoleWithPermissions] = useState<RoleWithPermissionsDTO | null>(
        null,
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accountResponse = await accountsApi.getAccountById({
                    accountId: roleRequest.accountId,
                });
                const roleResponse = await rolesApi.getRoleById({roleId: roleRequest.roleId});
                const permissionsResponse = await rolesApi.getPermissionsByRoleId({
                    roleId: roleRequest.roleId,
                });
                setAccount(accountResponse.data);
                setRole(roleResponse.data);
                setRoleWithPermissions(permissionsResponse.data);
            } catch (error) {
                console.error('Error fetching data for role request:', error);
            }
        };

        fetchData();
    }, [roleRequest]);

    const handleDecision = async (newStatus: string) => {
        try {
            await rolesRequestsApi.updateRoleRequestStatus({
                roleRequestId: roleRequest.id ?? '',
                newStatus,
            });
            onCancel();
        } catch (error) {
            console.error('Failed to update role request status:', error);
        }
    };

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <Text variant="header-2">
                Принятие решения о заявке на роль: <Label theme="info">{role?.name}</Label>
            </Text>
            <div style={{marginBottom: '20px', marginTop: '20px'}}>
                <Text variant="header-1">Информация о заявке</Text>
                <Card style={{padding: '16px', marginBottom: '10px'}}>
                    <Text variant="subheader-2">Причина:</Text>
                    <Text variant="subheader-1" color="secondary">
                        {roleRequest.reason}
                    </Text>
                </Card>
                <Card style={{padding: '16px', marginBottom: '10px'}}>
                    <Text variant="subheader-2">Аккаунт:</Text>
                    <Text variant="subheader-1" color="secondary">
                        {account
                            ? `${account.firstName} ${account.lastName} (${account.email})`
                            : 'Не загружено'}
                    </Text>
                </Card>
                <Card style={{padding: '16px', marginBottom: '10px'}}>
                    <Text variant="subheader-2">Роль:</Text>
                    <Text variant="subheader-1" color="secondary">
                        {role ? `${role.name} (${role.roleType})` : 'Не загружено'}
                    </Text>
                </Card>
                <Card style={{padding: '16px', marginBottom: '10px'}}>
                    <Text variant="subheader-2">Разрешения:</Text>
                    <ul>
                        {roleWithPermissions?.permissions &&
                            roleWithPermissions.permissions.map((permission) => (
                                <li key={permission.id}>
                                    <Text variant="subheader-1" color="secondary">
                                        {permission.resourceType}: {permission.actionType}
                                    </Text>
                                </li>
                            ))}
                    </ul>
                </Card>
            </div>
            <HorizontalStack>
                <Button view="normal" size="l" onClick={onCancel}>
                    Назад
                </Button>
                <Box marginLeft="20px">
                    <Button
                        view="outlined-success"
                        size="l"
                        onClick={() => handleDecision('APPROVED')}
                    >
                        Принять
                    </Button>
                </Box>
                <Box marginLeft="20px">
                    <Button
                        view="outlined-danger"
                        size="l"
                        onClick={() => handleDecision('DECLINED')}
                    >
                        Отклонить
                    </Button>
                </Box>
            </HorizontalStack>
        </div>
    );
};

export default RoleRequestDecisionModal;
