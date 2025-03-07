import React from 'react';

interface SpacerProps {
    size?: number;
}

export const Spacer: React.FC<SpacerProps> = ({size = 1}) => {
    return <div style={{flex: size}} />;
};
