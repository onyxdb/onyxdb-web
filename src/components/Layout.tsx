import React from 'react';

interface LayoutProps {
    header: string;
    children: React.ReactNode;
}

export const LayoutComponent: React.FC<LayoutProps> = ({header, children}) => {
    return (
        <div>
            <h1>{header}</h1>
            {children}
            {/*<Footer>© 2023 IDM System</Footer>*/}
        </div>
    );
};
