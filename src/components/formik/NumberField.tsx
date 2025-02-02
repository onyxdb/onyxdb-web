import React from 'react';
import {TextInput} from '@gravity-ui/uikit';

interface NumberFieldProps {
    label: string;
    name: string;
    value: number;
    onChange: (value: number) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
}) => {
    return (
        <div style={{marginBottom: '16px'}}>
            <label htmlFor={name} style={{display: 'block', marginBottom: '8px'}}>
                {label}
            </label>
            <TextInput
                id={name}
                name={name}
                type="number"
                value={value.toString()}
                onUpdate={(val) => onChange(Number(val))}
                onBlur={onBlur}
                placeholder={placeholder}
                error={error}
            />
            {/*{error && <div style={{color: 'red', marginTop: '4px'}}>{error}</div>}*/}
        </div>
    );
};
