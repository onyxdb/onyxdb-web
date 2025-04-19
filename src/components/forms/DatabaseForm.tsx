'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button, Modal, Text} from '@gravity-ui/uikit';
import {CreateMongoDatabaseRequest} from '@/generated/api-mdb';
import {InputField} from '@/components/formik/InputField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

interface DatabaseFormProps {
    closeAction: () => void;
    submitAction: (database: CreateMongoDatabaseRequest) => void;
    initialValue?: CreateMongoDatabaseRequest;
}

export const DatabaseForm: React.FC<DatabaseFormProps> = ({
    closeAction,
    submitAction,
    initialValue,
}) => {
    const formik = useFormik<CreateMongoDatabaseRequest>({
        initialValues: {
            name: initialValue?.name || '',
        },
        validate: (values) => {
            const errors: Partial<CreateMongoDatabaseRequest> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            } else if (values.name.length > 100) {
                errors.name = 'Название не должно превышать 100 символов';
            }
            return errors;
        },
        onSubmit: (values) => {
            submitAction(values);
            formik.resetForm();
        },
    });

    return (
        <Modal open={true} onOpenChange={closeAction}>
            <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                <Text variant="header-1">
                    {initialValue ? 'Редактирование базы данных' : 'Создание новой базы данных'}
                </Text>
                <form onSubmit={formik.handleSubmit} style={{marginTop: '20px'}}>
                    <InputField
                        label="Название"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                        error={formik.touched.name ? formik.errors.name : undefined}
                        placeholder="Введите название базы данных"
                    />
                    <HorizontalStack>
                        <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Box marginLeft="20px">
                            <Button
                                view="normal"
                                size="l"
                                onClick={closeAction}
                                disabled={formik.isSubmitting}
                            >
                                Отмена
                            </Button>
                        </Box>
                    </HorizontalStack>
                </form>
            </div>
        </Modal>
    );
};
