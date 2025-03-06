'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button} from '@gravity-ui/uikit';
import {DomainComponentDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';

interface DomainComponentFormProps {
    initialValue?: DomainComponentDTO;
    onSubmit: (values: DomainComponentDTO) => void;
}

export const DomainComponentForm: React.FC<DomainComponentFormProps> = ({
    initialValue,
    onSubmit,
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
            return errors;
        },
        onSubmit,
    });

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>
                {initialValue
                    ? 'Редактирование Domain Component'
                    : 'Создание нового Domain Component'}
            </h1>
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
                <InputField
                    label="Описание"
                    name="description"
                    value={formik.values.description ?? ''}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                />
                <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </form>
        </div>
    );
};
