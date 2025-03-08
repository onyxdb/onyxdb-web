import React from 'react';

interface SpacerProps {
    size?: number;
    axis?: 'vertical' | 'horizontal';
}

export const Spacer: React.FC<SpacerProps> = ({size, axis}) => {
    const finalAxis = axis ?? 'horizontal';

    const width = finalAxis === 'vertical' ? 1 : size;
    const height = finalAxis === 'horizontal' ? 1 : size;
    return (
        <span
            style={{
                display: 'block',
                width,
                minWidth: width,
                height,
                minHeight: height,
            }}
        />
    );
};
