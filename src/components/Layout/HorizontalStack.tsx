import React, {ReactNode} from 'react';
import {FlexContainer} from './FlexContainer';

interface HorizontalStackProps {
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

export const HorizontalStack: React.FC<HorizontalStackProps> = ({
    gap = 0,
    justify = 'flex-start',
    align = 'stretch',
    children,
}) => {
    return (
        <FlexContainer direction="row" justify={justify} align={align} gap={gap}>
            {children}
        </FlexContainer>
    );
};
