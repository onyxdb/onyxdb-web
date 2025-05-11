'use client';

import React, {useEffect, useState} from 'react';
import {Select, TextInput} from '@gravity-ui/uikit';

export enum ResourceUnitEnum {
    CORES = 'millicores',
    BYTES = 'bytes',
}

interface ResourceInputFieldProps {
    label?: string;
    name: string;
    value: number;
    changeAction: (value: number, unit: ResourceUnit) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    placeholder?: string;
    note?: React.ReactNode;
    unitType: ResourceUnitEnum;
    // max?: number;
    min?: number;

    [key: string]: unknown;
}

export interface ResourceUnit {
    value: string;
    label: string;
    coefficient: number;
}

export const CoresMilliCPU: ResourceUnit = {
    value: 'milliCPU',
    label: 'milliCPU',
    coefficient: 1,
};
export const CoresCPU: ResourceUnit = {value: 'cores', label: 'CPU', coefficient: 1000};

export const coresUnits = [CoresCPU, CoresMilliCPU];

export const BytesBytes: ResourceUnit = {value: 'bytes', label: 'bytes', coefficient: 1};
export const BytesMB: ResourceUnit = {value: 'MB', label: 'MB', coefficient: 1024 * 1024};
export const BytesGB: ResourceUnit = {value: 'GB', label: 'GB', coefficient: 1024 * 1024 * 1024};

export const bytesUnits = [BytesBytes, BytesMB, BytesGB];

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
    // max,
    min,
    ...props
}) => {
    const [currentValue, setCurrentValue] = useState<number>(value);
    const [currentUnit, setCurrentUnit] = useState<ResourceUnit>(CoresCPU);
    const [units, setUnits] = useState<ResourceUnit[]>([]);

    console.log('unit', label, unitType, units)
    useEffect(() => {
        if (unitType === ResourceUnitEnum.CORES) {
            setUnits(coresUnits);
            setCurrentUnit(CoresCPU);
        } else if (unitType === ResourceUnitEnum.BYTES) {
            setUnits(bytesUnits);
            setCurrentUnit(BytesGB);
        }
    }, [unitType]);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const convertToBaseUnit = (val: number, res: ResourceUnit): number => {
        return val * res.coefficient;
    };

    const convertFromBaseUnit = (val: number, res: ResourceUnit): number => {
        return val / res.coefficient;
    };

    const handleValueChange = (newValue: string) => {
        const parsedValue = parseFloat(newValue);
        const val = convertToBaseUnit(parsedValue, currentUnit);
        const valMinMaxed = min === undefined ? val : Math.max(val, min);
        setCurrentValue(valMinMaxed);
        // console.info('handleValueChange', valMinMaxed, currentUnit);
        changeAction(valMinMaxed, currentUnit);
    };

    const handleUnitChange = (newUnit: string[]) => {
        const unit = newUnit[0];
        const selectedUnit = units.find((u) => u.value === unit);
        if (selectedUnit) {
            setCurrentUnit(selectedUnit);
            console.info('handleUnitChange', unit);
            changeAction(currentValue, selectedUnit);
        }
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
                    value={[currentUnit.value]}
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
