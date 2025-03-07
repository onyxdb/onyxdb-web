import React, {CSSProperties, ReactNode} from 'react';

interface BoxProps {
    children: ReactNode;
    margin?: string | number;
    marginTop?: string | number;
    marginRight?: string | number;
    marginBottom?: string | number;
    marginLeft?: string | number;
    padding?: string | number;
    paddingTop?: string | number;
    paddingRight?: string | number;
    paddingBottom?: string | number;
    paddingLeft?: string | number;
    width?: string | number;
    height?: string | number;
    style?: CSSProperties;
}

export const Box: React.FC<BoxProps> = ({
    children,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    width,
    height,
    style,
}) => {
    const boxStyle: CSSProperties = {
        margin,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
        padding,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        width,
        height,
        ...style,
    };

    return <div style={boxStyle}>{children}</div>;
};
