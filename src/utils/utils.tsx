import {RoleDTO} from '@/generated/api';
import {Label, Text} from '@gravity-ui/uikit';
import React from 'react';

export function getLinkedResourceLabel(role: RoleDTO) {
    if (role.productId) {
        return (
            <div>
                <Label theme="utility">{role.entity}</Label>{' '}
                <Label theme="info">{role.productId}</Label>
            </div>
        );
    }
    if (role.orgUnitId) {
        return (
            <div>
                <Label theme="utility">{role.entity}</Label>
                <Label theme="info">{role.orgUnitId}</Label>
            </div>
        );
    }
    return (
        <div>
            <Label theme="utility">{role.entity ?? 'Глобальная'}</Label>
        </div>
    );
}

export function getLinkedResource(role: RoleDTO) {
    return (
        <Text variant="subheader-1">
            {role.shopName}: {getLinkedResourceLabel(role)}
        </Text>
    );
}

export function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
