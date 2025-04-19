'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Text} from '@gravity-ui/uikit';
import {MongoUserToCreate} from '@/generated/api-mdb';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface DBUserFormProps {
    closeAction: () => void;
    submitAction: (user: MongoUserToCreate) => void;
    initialValue?: MongoUserToCreate;
}

export const DBUserForm: React.FC<DBUserFormProps> = ({
    closeAction,
    submitAction,
    initialValue,
}) => {
    const formik = useFormik<MongoUserToCreate>({
        initialValues: {
            name: initialValue?.name || '',
            password: initialValue?.password || '',
            permissions: initialValue?.permissions || [],
        },
        validate: (values) => {
            const errors: Partial<MongoUserToCreate> = {};
            if (!values.name) {
                errors.name = 'Имя пользователя обязательно';
            }
            if (!values.password) {
                errors.password = 'Пароль обязателен';
            }
            return errors;
        },
        onSubmit: (values) => {
            submitAction(values);
            formik.resetForm();
        },
    });

    const handleAddPermission = () => {
        formik.setFieldValue('permissions', [
            ...formik.values.permissions,
            {databaseId: '', roles: []},
        ]);
    };

    const handleRemovePermission = (index: number) => {
        const updatedPermissions = formik.values.permissions.filter((_, i) => i !== index);
        formik.setFieldValue('permissions', updatedPermissions);
    };

    const handlePermissionChange = (index: number, field: string, value: string | string[]) => {
        const updatedPermissions = formik.values.permissions.map((permission, i) => {
            if (i === index) {
                return {
                    ...permission,
                    [field]: value,
                };
            }
            return permission;
        });
        formik.setFieldValue('permissions', updatedPermissions);
    };

    return (
        <Modal open={true} onOpenChange={closeAction}>
            <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                <Text variant="header-1">
                    {initialValue ? 'Редактирование пользователя' : 'Создание нового пользователя'}
                </Text>
                <form onSubmit={formik.handleSubmit} style={{marginTop: '20px'}}>
                    <InputField
                        label="Имя пользователя"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                        error={formik.touched.name ? formik.errors.name : undefined}
                        placeholder="Введите имя пользователя"
                    />
                    <InputField
                        label="Пароль"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange('password')}
                        onBlur={formik.handleBlur('password')}
                        error={formik.touched.password ? formik.errors.password : undefined}
                        placeholder="Введите пароль"
                        type="password"
                    />
                    <Box marginTop="20px">
                        <div>
                            <Text variant="header-1">Разрешения</Text>
                        </div>
                        {formik.values.permissions.map((permission, index) => (
                            <Card key={index} style={{marginBottom: '20px'}}>
                                <InputField
                                    label="ID базы данных"
                                    name={`permissions[${index}].databaseId`}
                                    value={permission.databaseId}
                                    onChange={(e) => handlePermissionChange(index, 'databaseId', e)}
                                    onBlur={formik.handleBlur(`permissions[${index}].databaseId`)}
                                    placeholder="Введите ID базы данных"
                                />
                                <TextAreaField
                                    label="Роли"
                                    name={`permissions[${index}].roles`}
                                    value={permission.roles.join(', ')}
                                    onChange={(e) =>
                                        handlePermissionChange(
                                            index,
                                            'roles',
                                            e.split(', ').filter((r) => r),
                                        )
                                    }
                                    onBlur={formik.handleBlur(`permissions[${index}].roles`)}
                                    placeholder="Введите роли через запятую"
                                />
                                <Button
                                    view="outlined"
                                    size="m"
                                    onClick={() => handleRemovePermission(index)}
                                >
                                    Удалить разрешение
                                </Button>
                            </Card>
                        ))}
                        <Button
                            view="normal"
                            size="m"
                            onClick={handleAddPermission}
                            style={{marginTop: '8px', marginBottom: '16px'}}
                        >
                            Добавить разрешение
                        </Button>
                    </Box>
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
