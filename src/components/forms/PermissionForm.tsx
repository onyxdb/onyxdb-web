'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button, Text} from '@gravity-ui/uikit';
import {InputField} from '@/components/formik/InputField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {TextAreaField} from '@/components/formik/TextAreaField';

interface PermissionFormProps {
    onSubmit: (values: PermissionFormFields) => void;
    closeAction: () => void;
    initialValue?: PermissionFormFields;
}

export interface PermissionFormFields {
    id?: string;
    actionType: string;
    resourceType: string;
    data: {[key: string]: string};
    deleted: boolean;
}

export const PermissionForm: React.FC<PermissionFormProps> = ({
    onSubmit,
    closeAction,
    initialValue,
}) => {
    const formik = useFormik<PermissionFormFields>({
        initialValues: {
            actionType: initialValue?.actionType ?? '',
            resourceType: initialValue?.resourceType ?? '',
            data: initialValue?.data ?? {},
            deleted: initialValue?.deleted ?? false,
        },
        validate: (values) => {
            const errors: Partial<PermissionFormFields> = {};
            if (!values.actionType) {
                errors.actionType = 'Тип действия обязателен';
            }
            if (!values.resourceType) {
                errors.resourceType = 'Тип ресурса обязателен';
            }
            // if (values.data) {
            //     try {
            //         formik.setFieldValue('data', JSON.parse(values.data));
            //     } catch (e) {
            //         console.error('Invalid JSON:', e);
            //         errors.resourceType = 'Тип ресурса обязателен';
            //     }
            // }
            return errors;
        },
        onSubmit,
    });

    const handleDataAdd = () => {
        const newData = {...formik.values.data};
        const key = prompt('Введите ключ:');
        const value = prompt('Введите значение:');
        if (key && value) {
            newData[key] = value;
            formik.setFieldValue('data', newData);
        }
    };

    const handleDataRemove = (key: string) => {
        const newData = {...formik.values.data};
        delete newData[key];
        formik.setFieldValue('data', newData);
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>{initialValue ? 'Редактирование разрешения' : 'Создание нового разрешения'}</h1>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Тип действия"
                    name="actionType"
                    value={formik.values.actionType}
                    onChange={(value) => formik.setFieldValue('actionType', value)}
                    onBlur={formik.handleBlur('actionType')}
                    error={formik.touched.actionType ? formik.errors.actionType : undefined}
                    placeholder="Введите тип действия"
                    note="Тип действия, например, get | create | update | delete"
                />
                <InputField
                    label="Название ресурса"
                    name="resourceType"
                    value={formik.values.resourceType}
                    onChange={(value) => formik.setFieldValue('resourceType', value)}
                    onBlur={formik.handleBlur('resourceType')}
                    error={formik.touched.resourceType ? formik.errors.resourceType : undefined}
                    placeholder="Введите ресурс"
                    note="Ресурс для которого создаётся доступ, например, WEB, IDM, MDB"
                />
                <TextAreaField
                    label="Данные"
                    name="data"
                    value={JSON.stringify(formik.values.data, null, 2)}
                    onChange={(value) => {
                        try {
                            formik.setFieldValue('data', JSON.parse(value));
                        } catch (e) {
                            console.error('Invalid JSON:', e);
                        }
                    }}
                    onBlur={formik.handleBlur('data')}
                    // error={formik.touched.data ? formik.errors.data : undefined}
                    placeholder="Введите данные в формате JSON"
                    note="Данные разрешения в формате ключ-значение"
                />
                <Box marginTop="20px">
                    <HorizontalStack>
                        <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Box marginLeft="20px">
                            <Button
                                view="normal"
                                size="l"
                                disabled={formik.isSubmitting}
                                onClick={closeAction}
                            >
                                Отменить
                            </Button>
                        </Box>
                        <Box marginLeft="20px">
                            <Button
                                view="normal"
                                size="l"
                                disabled={formik.isSubmitting}
                                onClick={handleDataAdd}
                            >
                                Добавить данные
                            </Button>
                        </Box>
                    </HorizontalStack>
                </Box>
                {Object.keys(formik.values.data).map((key) => (
                    <div key={key} style={{marginTop: '20px'}}>
                        <Text variant="subheader-1">
                            {key}: {formik.values.data[key]}
                        </Text>
                        <Button
                            view="outlined-danger"
                            size="m"
                            onClick={() => handleDataRemove(key)}
                            disabled={formik.isSubmitting}
                            style={{marginLeft: '10px'}}
                        >
                            Удалить
                        </Button>
                    </div>
                ))}
            </form>
        </div>
    );
};

export default PermissionForm;
