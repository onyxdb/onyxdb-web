'use client';

import React from 'react';
import Link from 'next/link';
import {Breadcrumbs, BreadcrumbsItem, Button} from '@gravity-ui/uikit';
import '../../styles/globals.css';

export enum ButtonView {
    Normal = 'normal',
    Action = 'action',
    Outlined = 'outlined',
    OutlinedInfo = 'outlined-info',
    OutlinedSuccess = 'outlined-success',
    OutlinedWarning = 'outlined-warning',
    OutlinedDanger = 'outlined-danger',
    OutlinedUtility = 'outlined-utility',
    OutlinedAction = 'outlined-action',
    Raised = 'raised',
    Flat = 'flat',
    FlatSecondary = 'flat-secondary',
    FlatInfo = 'flat-info',
    FlatSuccess = 'flat-success',
    FlatWarning = 'flat-warning',
    FlatDanger = 'flat-danger',
    FlatUtility = 'flat-utility',
    FlatAction = 'flat-action',
    NormalContrast = 'normal-contrast',
    OutlinedContrast = 'outlined-contrast',
    FlatContrast = 'flat-contrast',
}

interface BreadCrumb {
    href: string;
    text: string;
}

interface ActionButton {
    text: string;
    action: () => void;
    icon: React.ReactNode;
    view?: ButtonView;
}

interface HeaderActionsProps {
    breadCrumbs: BreadCrumb[];
    actions?: ActionButton[];
}

// @ts-ignore
function RouterLink({href, ...rest}) {
    return (
        <Link href={href} passHref className="page-header breadcrumbs">
            <BreadcrumbsItem {...rest} />
        </Link>
    );
}

export const AppHeader: React.FC<HeaderActionsProps> = ({breadCrumbs, actions}) => {
    return (
        <header className="page-header top-aligned">
            {/*<div className="page-header__content">*/}
            <div style={{width: '100%', marginLeft: '10px'}}>
                <Breadcrumbs itemComponent={RouterLink} showRoot maxItems={10}>
                    {breadCrumbs.map((crumb, index) => (
                        <RouterLink key={index} href={crumb.href}>
                            {crumb.text}
                        </RouterLink>
                    ))}
                </Breadcrumbs>
            </div>
            <div className="page-header__actions">
                {actions &&
                    actions.map((action, index) => (
                        <Button
                            key={index}
                            view={action.view ?? 'action'}
                            size="m"
                            onClick={action.action}
                            icon={action.icon}
                            style={{marginRight: '10px'}}
                        >
                            {action.text}
                        </Button>
                    ))}
            </div>
        </header>
    );
};
