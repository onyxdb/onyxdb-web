'use client';

import React from 'react';
import {Button, Modal, Text} from '@gravity-ui/uikit';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface ConfirmationModalProps {
    open: boolean;
    closeAction: () => void;
    confirmAction: () => void;
    title: string;
    message: string;
    confirmButtonText: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    open,
    closeAction,
    confirmAction,
    title,
    message,
    confirmButtonText,
}) => {
    return (
        <Modal open={open} onOpenChange={closeAction}>
            <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                <Text variant="header-1">{title}</Text>
                <Box marginTop="20px">
                    <Text variant="body-1">{message}</Text>
                </Box>
                <Box marginTop="20px">
                    <HorizontalStack>
                        <Button view="action" size="m" onClick={confirmAction}>
                            {confirmButtonText}
                        </Button>
                        <Box marginLeft="20px">
                            <Button view="normal" size="m" onClick={closeAction}>
                                Отмена
                            </Button>
                        </Box>
                    </HorizontalStack>
                </Box>
            </div>
        </Modal>
    );
};
