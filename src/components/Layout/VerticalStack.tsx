import React, {ReactNode} from 'react';
import {FlexContainer} from './FlexContainer';

interface VerticalStackProps {
    gap?: number;
    justify?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly';
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    children: ReactNode;
}

export const VerticalStack: React.FC<VerticalStackProps> = ({
    gap = 0,
    justify = 'flex-start',
    align = 'stretch',
    children,
}) => {
    return (
        <FlexContainer direction="column" justify={justify} align={align} gap={gap}>
            {children}
        </FlexContainer>
    );
};
