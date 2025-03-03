'use client';

import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {useFormik} from 'formik';
import {Button, TextArea, TextInput} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';

interface DomainComponentFormProps {
    initialValues?: {
        id?: string;
        name?: string;
        description?: string;
    };
    onSubmit: (values: {name: string; description: string}) => Promise<void>;
    onDelete?: () => void;
}

export const DomainComponentForm: React.FC<DomainComponentFormProps> = ({
    initialValues,
    onSubmit,
    onDelete,
}) => {
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            name: initialValues?.name || '',
            description: initialValues?.description || '',
        },
        validate: (values) => {
            const errors: {name?: string; description?: string} = {};

            if (!values.name) {
                errors.name = 'Название обязательно';
            }

            if (!values.description) {
                errors.description = 'Описание обязательно';
            }

            return errors;
        },
        onSubmit: async (values) => {
            await onSubmit(values);
            router.push('/domain-components'); // Перенаправление после успешного сохранения
        },
    });

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <form onSubmit={formik.handleSubmit}>
                <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Название</label>
                    <TextInput
                        name="name"
                        value={formik.values.name}
                        onUpdate={(value) => formik.setFieldValue('name', value)}
                        onBlur={formik.handleBlur('name')}
                        error={formik.touched.name && formik.errors.name}
                        placeholder="Введите название"
                    />
                </div>
                <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Описание</label>
                    <TextArea
                        name="description"
                        value={formik.values.description}
                        onUpdate={(value) => formik.setFieldValue('description', value)}
                        onBlur={formik.handleBlur('description')}
                        error={formik.touched.description && formik.errors.description}
                        placeholder="Введите описание"
                    />
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    {onDelete && (
                        <Button
                            type="button"
                            view="outlined-danger"
                            size="l"
                            onClick={onDelete}
                            disabled={formik.isSubmitting}
                        >
                            Удалить
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};
