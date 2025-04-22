'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button, Text} from '@gravity-ui/uikit';
import {DomainComponentDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {TextAreaField} from '@/components/formik/TextAreaField';

interface DomainComponentFormProps {
    initialValue?: DomainComponentDTO;
    submitAction: (values: DomainComponentDTO) => void;
    closeAction: () => void;
}

export const DomainComponentForm: React.FC<DomainComponentFormProps> = ({
    initialValue,
    submitAction,
    closeAction,
}) => {
    const formik = useFormik<DomainComponentDTO>({
        initialValues: initialValue ?? {
            id: '',
            name: '',
            description: '',
        },
        validate: (values) => {
            const errors: Partial<DomainComponentDTO> = {};
            if (!values.name) {
                errors.name = 'Имя обязательно';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            return errors;
        },
        onSubmit: submitAction,
    });

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <Text variant="header-1">
                {initialValue
                    ? 'Редактирование Domain Component'
                    : 'Создание нового Domain Component'}
            </Text>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name ?? ''}
                    onChange={(value) => formik.setFieldValue('name', value)}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name ? formik.errors.name : undefined}
                    placeholder="Введите название"
                />
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description ?? ''}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                />
                <HorizontalStack>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Box marginLeft="10px">
                        <Button view="normal" onClick={closeAction}>
                            Закрыть
                        </Button>
                    </Box>
                </HorizontalStack>
            </form>
        </div>
    );
};
