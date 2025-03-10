'use client';

import React from 'react';
import Link from 'next/link';
import {Breadcrumbs, BreadcrumbsItem, Button} from '@gravity-ui/uikit';
import '../../styles/globals.css';

interface HeaderActionsProps {
    breadCrumps: {href: string; text: string}[];
    actions?: {text: string; action: () => void; icon: React.ReactNode}[];
}

// @ts-ignore
function RouterLink({href, ...rest}) {
    return (
        <Link href={href} legacyBehavior>
            <BreadcrumbsItem {...rest} />
        </Link>
    );
}

export const AppHeader: React.FC<HeaderActionsProps> = ({breadCrumps, actions}) => {
    return (
        <header className="page-header top-aligned">
            {/*<div className="page-header__content">*/}
            <div style={{width: '100%', marginLeft: '10px'}}>
                <Breadcrumbs itemComponent={RouterLink} showRoot maxItems={10}>
                    {breadCrumps.map((crumb, index) => (
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
                            view="action"
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
