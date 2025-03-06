import React, {ReactNode} from 'react';
import styles from './FlexContainer.module.css';

interface FlexContainerProps {
    direction?: 'row' | 'column';
    justify?:
        | 'flex-start'
        | 'flex-end'
        | 'center'
        | 'space-between'
        | 'space-around'
        | 'space-evenly';
    align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    gap?: number;
    children: ReactNode;
}

export const FlexContainer: React.FC<FlexContainerProps> = ({
    direction = 'row',
    justify = 'flex-start',
    align = 'stretch',
    gap = 0,
    children,
}) => {
    return (
        <div
            className={styles.flexContainer}
            style={{
                display: 'flex',
                flexDirection: direction,
                justifyContent: justify,
                alignItems: align,
                gap: `${gap}px`,
            }}
        >
            {children}
        </div>
    );
};
