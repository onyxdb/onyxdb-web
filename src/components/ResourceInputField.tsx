'use client';
import React, {useEffect, useState} from 'react';
import {Select, TextInput} from '@gravity-ui/uikit';
import {ResourceUnitEnum} from '@/generated/api-mdb'; // Предполагается, что ResourceUnitEnum определён в этом файле

interface ResourceInputFieldProps {
    label?: string;
    name: string;
    value: number;
    changeAction: (value: number, unit: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
    note?: React.ReactNode;
    unitType: ResourceUnitEnum;

    [key: string]: unknown;
}

export const ResourceInputField: React.FC<ResourceInputFieldProps> = ({
    label,
    name,
    value,
    changeAction,
    onBlur,
    error,
    placeholder,
    note,
    unitType,
    ...props
}) => {
    const [currentValue, setCurrentValue] = useState<number>(value);
    const [currentUnit, setCurrentUnit] = useState<string>(''); // Постоянное состояние текущего измерения

    const coresUnits = [
        {value: 'cores', label: 'CPU', coefficient: 1},
        {value: 'milliCPU', label: 'milliCPU', coefficient: 1000},
    ];

    const bytesUnits = [
        {value: 'GB', label: 'GB', coefficient: 1024 * 1024 * 1024},
        {value: 'MB', label: 'MB', coefficient: 1024 * 1024},
        {value: 'bytes', label: 'bytes', coefficient: 1},
    ];

    const [units, setUnits] = useState<{value: string; label: string; coefficient: number}[]>([]);

    useEffect(() => {
        if (unitType === ResourceUnitEnum.Cores) {
            setUnits(coresUnits);
            setCurrentUnit('cores');
        } else if (unitType === ResourceUnitEnum.Bytes) {
            setUnits(bytesUnits);
            setCurrentUnit('bytes');
        }
    }, [unitType]);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const convertToBaseUnit = (val: number, unit: string): number => {
        const selectedUnit = units.find((u) => u.value === unit);
        if (selectedUnit) {
            return val / selectedUnit.coefficient;
        }
        return val;
    };

    const convertFromBaseUnit = (val: number, unit: string): number => {
        const selectedUnit = units.find((u) => u.value === unit);
        if (selectedUnit) {
            return val * selectedUnit.coefficient;
        }
        return val;
    };

    const handleValueChange = (newValue: string) => {
        const parsedValue = parseFloat(newValue);
        setCurrentValue(parsedValue);
        const val = convertToBaseUnit(parsedValue, currentUnit);
        console.log('handleValueChange', val);
        changeAction(val, currentUnit);
    };

    const handleUnitChange = (newUnit: string[]) => {
        const unit = newUnit[0];
        setCurrentUnit(unit);
        const val = convertToBaseUnit(currentValue, unit);
        console.log('handleUnitChange', val);
        changeAction(val, currentUnit);
    };

    return (
        <div style={{marginBottom: '16px'}}>
            {label && (
                <label htmlFor={name} style={{display: 'block', marginBottom: '8px'}}>
                    {label}
                </label>
            )}
            <div style={{display: 'flex', gap: '8px'}}>
                <div style={{maxWidth: '200px'}}>
                    <TextInput
                        id={name}
                        name={name}
                        value={convertFromBaseUnit(currentValue, currentUnit).toString()}
                        onUpdate={handleValueChange}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        error={error}
                        note={note}
                        type="number"
                        {...props}
                    />
                </div>
                <Select
                    size="m"
                    value={[currentUnit]}
                    onUpdate={handleUnitChange}
                    placeholder="Выберите единицу измерения"
                    width={100}
                >
                    {units.map((unit) => (
                        <Select.Option key={unit.value} value={unit.value}>
                            {unit.label}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            {/*{error && <div style={{color: 'red', marginTop: '4px'}}>{error}</div>}*/}
        </div>
    );
};
