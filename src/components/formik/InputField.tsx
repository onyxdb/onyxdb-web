import React from 'react';
import {TextInput} from '@gravity-ui/uikit';

interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
    note?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    note,
}) => {
    return (
        <div style={{marginBottom: '16px'}}>
            <label htmlFor={name} style={{display: 'block', marginBottom: '8px'}}>
                {label}
            </label>
            <TextInput
                id={name}
                name={name}
                value={value}
                onUpdate={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                error={error}
                note={note}
            />
            {/*{error && <div style={{color: 'red', marginTop: '4px'}}>{error}</div>}*/}
        </div>
    );
};
