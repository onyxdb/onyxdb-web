'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button} from '@gravity-ui/uikit';
import {InputField} from '@/components/formik/InputField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {TextAreaField} from '@/components/formik/TextAreaField';

interface OrgEditFormProps {
    onSubmit: (values: OrgUnitFormFields) => void;
    closeAction: () => void;
    initialValues: OrgUnitFormFields;
}

export interface OrgUnitFormFields {
    name: string;
    description: string;
}

export const OrgEditForm: React.FC<OrgEditFormProps> = ({onSubmit, closeAction, initialValues}) => {
    const formik = useFormik<OrgUnitFormFields>({
        initialValues: {
            name: initialValues.name,
            description: initialValues.description,
        },
        validate: (values) => {
            const errors: Partial<OrgUnitFormFields> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            return errors;
        },
        onSubmit,
    });

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Изменение нового Organization Unit</h1>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name}
                    onChange={(value) => formik.setFieldValue('name', value)}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name ? formik.errors.name : undefined}
                    placeholder="Введите название"
                />
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                />
                <HorizontalStack>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Изменение...' : 'Изменить OU'}
                    </Button>
                    <Box marginLeft="20px">
                        <Button view="normal" size="l" disabled={formik.isSubmitting} onClick={closeAction}>
                            {'Отменить'}
                        </Button>
                    </Box>
                </HorizontalStack>
            </form>
        </div>
    );
};
