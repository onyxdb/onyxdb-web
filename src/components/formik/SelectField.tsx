import React from 'react';
import {Select, SelectOption} from '@gravity-ui/uikit';

interface SelectFieldProps {
    label?: string;
    name: string;
    value: string[];
    onUpdate: (value: string[]) => void;
    options: SelectOption[];
    onBlur?: (e: React.FocusEvent) => void;
    error?: string;
    placeholder?: string;
    width?: number;

    [key: string]: unknown;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    name,
    value,
    onUpdate,
    options,
    onBlur,
    error,
    placeholder,
    width,
    ...props
}) => {
    return (
        <div style={{marginBottom: '16px'}}>
            {label && (
                <label htmlFor={name} style={{display: 'block', marginBottom: '8px'}}>
                    {label}
                </label>
            )}
            <Select
                size="m"
                value={value}
                onUpdate={onUpdate}
                onBlur={onBlur}
                placeholder={placeholder}
                width={width}
                errorMessage={error}
                {...props}
            >
                {options.map((unit) => (
                    <Select.Option key={unit.value} value={unit.value}>
                        {unit.text}
                    </Select.Option>
                ))}
            </Select>
            {/*{error && <div style={{color: 'red', marginTop: '4px'}}>{error}</div>}*/}
        </div>
    );
};
