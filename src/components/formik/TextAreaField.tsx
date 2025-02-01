import React from 'react';
import {TextArea} from '@gravity-ui/uikit';

interface TextAreaFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    error?: string;
    placeholder?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
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
            <TextArea
                id={name}
                name={name}
                value={value}
                onUpdate={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                error={error}
            />
            {error && <div style={{color: 'red', marginTop: '4px'}}>{error}</div>}
        </div>
    );
};
