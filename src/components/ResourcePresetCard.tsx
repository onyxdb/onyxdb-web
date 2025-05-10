import React from 'react';
import {Card, Text} from '@gravity-ui/uikit';
import {ResourcePresetResponseDTO} from '@/generated/api';
import {VerticalStack} from '@/components/Layout/VerticalStack';

interface ResourcePresetCardProps {
    preset: ResourcePresetResponseDTO;
    onSelect: (preset: ResourcePresetResponseDTO) => void;
    isActive: boolean;
}

export const ResourcePresetCard: React.FC<ResourcePresetCardProps> = ({
    preset,
    onSelect,
    isActive,
}) => {
    const convertRamToGB = (ram: number) => (ram / 1024 / 1024 / 1024).toFixed(2);

    return (
        <Card
            type="selection"
            style={{marginBottom: '10px', padding: '10px'}}
            selected={isActive}
            onClick={() => onSelect(preset)}
        >
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <VerticalStack>
                    <Text variant="subheader-3" style={{marginBottom: '5px'}}>
                        {preset.type}
                    </Text>
                    <Text variant="subheader-1" color="secondary">
                        CPU: {preset.vcpu} ядра
                    </Text>
                    <Text variant="subheader-1" color="secondary">
                        RAM: {convertRamToGB(preset.ram)} ГБ
                    </Text>
                </VerticalStack>
            </div>
        </Card>
    );
};
