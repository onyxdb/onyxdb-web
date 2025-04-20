import React, {useState} from 'react';
import {Copy} from '@gravity-ui/icons';
import {Icon, Text, Tooltip} from '@gravity-ui/uikit';

interface TextWithCopyProps {
    text: string;
    maxLength?: number;
}

export const TextWithCopy = ({text, maxLength = 50}: TextWithCopyProps) => {
    const [isCopied, setIsCopied] = useState(false);

    const truncatedText = text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Text>{truncatedText}</Text>

            <Tooltip content={isCopied ? 'Скопировано!' : 'Копировать'}>
                <div
                    style={{cursor: 'pointer', color: 'var(--g-color-text-link)'}}
                    onClick={handleCopy}
                >
                    <Icon data={Copy} size={16} />
                </div>
            </Tooltip>
        </div>
    );
};
