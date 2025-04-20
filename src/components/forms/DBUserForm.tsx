'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Radio, RadioGroup, Select, Text} from '@gravity-ui/uikit';
import {
    ListMongoDatabasesResponse,
    MongoPermissionToCreate,
    MongoUserToCreate,
} from '@/generated/api-mdb';
import {InputField} from '@/components/formik/InputField';
import {Box} from '@/components/Layout/Box';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {mdbMongoDbDatabasesApi} from '@/app/apis';

interface DBUserFormProps {
    clusterId: string;
    closeAction: () => void;
    submitAction: (user: MongoUserToCreate) => void;
    initialValue?: MongoUserToCreate;
}

const V1DatabaseUserRolesEnum = {
    READ: 'read',
    READ_WRITE: 'readWrite',
} as const;

export const DBUserForm: React.FC<DBUserFormProps> = ({
    clusterId,
    closeAction,
    submitAction,
    initialValue,
}) => {
    const [databases, setDatabases] = useState<ListMongoDatabasesResponse['databases']>([]);

    const formik = useFormik<MongoUserToCreate>({
        initialValues: {
            name: initialValue?.name || '',
            password: initialValue?.password || '',
            permissions: initialValue?.permissions || [{databaseId: '', roles: []}],
        },
        validate: (values) => {
            const errors: Partial<MongoUserToCreate> = {};
            if (!values.name) {
                errors.name = 'Имя пользователя обязательно';
            }
            if (!values.password) {
                errors.password = 'Пароль обязателен';
            }

            const errorsPermission: MongoPermissionToCreate[] = [];
            values.permissions.forEach((permission, index) => {
                if (!permission.databaseId || permission.roles.length === 0) {
                    const permissionErrorDB = permission.databaseId
                        ? ''
                        : 'ID базы данных обязателен';
                    const permissionErrorRoles =
                        permission.roles && permission.roles.length >= 0
                            ? []
                            : ['Обязательно указать хотя бы одну роль'];
                    if (permissionErrorDB.length > 0 || permissionErrorRoles.length > 0) {
                        errorsPermission[index] = {
                            databaseId: permissionErrorDB,
                            roles: permissionErrorRoles,
                        };
                    }
                }
            });
            if (errorsPermission.length > 0) {
                errors.permissions = errorsPermission;
            }

            return errors;
        },
        onSubmit: (values) => {
            submitAction(values);
            formik.resetForm();
        },
    });

    useEffect(() => {
        const fetchDatabases = async () => {
            try {
                const response = await mdbMongoDbDatabasesApi.listDatabases({clusterId});
                setDatabases(response.data.databases);
            } catch (error) {
                console.error('Error fetching databases:', error);
            }
        };

        fetchDatabases();
    }, [clusterId]);

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
                        <div style={{marginBottom: '8px'}}>
                            <Text variant="header-1">Разрешения</Text>
                        </div>
                        {formik.values.permissions.map((permission, index) => (
                            <Card key={index} style={{padding: '10px', marginBottom: '10px'}}>
                                <Box marginBottom="10px">
                                    <RadioGroup
                                        name={`permissions[${index}].databaseId`}
                                        value={permission.databaseId}
                                        onUpdate={(value: string) =>
                                            handlePermissionChange(index, 'databaseId', value)
                                        }
                                    >
                                        {databases.map((db) => (
                                            <Radio
                                                key={db.id}
                                                value={db.id}
                                                content={db.name}
                                                size="m"
                                            />
                                        ))}
                                    </RadioGroup>
                                    {formik.touched.permissions?.[index]?.databaseId &&
                                        formik.errors.permissions &&
                                        (
                                            formik.errors.permissions[
                                                index
                                            ] as MongoPermissionToCreate
                                        )?.databaseId && (
                                            <Text
                                                variant="body-1"
                                                color="danger"
                                                style={{marginTop: '4px'}}
                                            >
                                                {
                                                    (
                                                        formik.errors.permissions[
                                                            index
                                                        ] as MongoPermissionToCreate
                                                    ).databaseId
                                                }
                                            </Text>
                                        )}
                                </Box>
                                <Box marginBottom="10px">
                                    <Select
                                        multiple={true}
                                        placeholder="Выберите роли"
                                        name={`permissions[${index}].roles`}
                                        value={permission.roles}
                                        onUpdate={(value: string[]) =>
                                            handlePermissionChange(index, 'roles', value)
                                        }
                                        errorMessage={
                                            formik.touched.permissions?.[index]?.roles &&
                                            formik.errors.permissions &&
                                            (
                                                formik.errors.permissions[
                                                    index
                                                ] as MongoPermissionToCreate
                                            )?.roles &&
                                            (
                                                formik.errors.permissions[
                                                    index
                                                ] as MongoPermissionToCreate
                                            ).roles[0]
                                        }
                                        validationState={
                                            formik.touched.permissions?.[index]?.roles &&
                                            formik.errors.permissions &&
                                            (
                                                formik.errors.permissions[
                                                    index
                                                ] as MongoPermissionToCreate
                                            )?.roles.length > 0
                                                ? 'invalid'
                                                : undefined
                                        }
                                    >
                                        {Object.values(V1DatabaseUserRolesEnum).map((role) => (
                                            <Select.Option key={role} value={role}>
                                                {role}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Box>
                                <Button
                                    view="outlined-danger"
                                    size="m"
                                    onClick={() => handleRemovePermission(index)}
                                >
                                    Удалить разрешение
                                </Button>
                            </Card>
                        ))}
                        <Button
                            view="outlined-success"
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
