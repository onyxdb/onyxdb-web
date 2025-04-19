'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button, Modal, Select, Text} from '@gravity-ui/uikit';
import {
    MongoHost,
    MongoHostRoleEnum,
    MongoHostStatusEnum,
    MongoHostTypeEnum,
} from '@/generated/api-mdb';
import {InputField} from '@/components/formik/InputField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

interface HostFormProps {
    clusterId: string;
    closeAction: () => void;
    submitAction: (host: MongoHost) => void;
    initialValue?: MongoHost;
}

export const HostForm: React.FC<HostFormProps> = ({
    clusterId,
    closeAction,
    submitAction,
    initialValue,
}) => {
    const formik = useFormik<MongoHost>({
        initialValues: {
            name: initialValue?.name || '',
            type: initialValue?.type || MongoHostTypeEnum.Mongod,
            clusterId: clusterId,
            status: initialValue?.status || MongoHostStatusEnum.Unknown,
            role: initialValue?.role || MongoHostRoleEnum.Unknown,
        },
        validate: (values) => {
            const errors: Partial<MongoHost> = {};
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

    const typeOptions = Object.values(MongoHostTypeEnum).map((type) => (
        <Select.Option key={type} value={type}>
            {type}
        </Select.Option>
    ));

    const roleOptions = Object.values(MongoHostRoleEnum).map((role) => (
        <Select.Option key={role} value={role}>
            {role}
        </Select.Option>
    ));

    return (
        <Modal open={true} onOpenChange={closeAction}>
            <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                <Text variant="header-1">
                    {initialValue ? 'Редактирование хоста' : 'Создание нового хоста'}
                </Text>
                <form onSubmit={formik.handleSubmit} style={{marginTop: '20px'}}>
                    <InputField
                        label="Название"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                        error={formik.touched.name ? formik.errors.name : undefined}
                        placeholder="Введите название хоста"
                    />
                    <HorizontalStack justify="space-between">
                        <div style={{marginBottom: '16px'}}>
                            <label style={{display: 'block', marginBottom: '8px'}}>Тип</label>
                            <Select
                                size="m"
                                placeholder="Выберите тип"
                                value={[formik.values.type]}
                                onUpdate={(value: string[]) =>
                                    formik.setFieldValue('type', value[0] as MongoHostTypeEnum)
                                }
                            >
                                {typeOptions}
                            </Select>
                        </div>
                        <div>
                            <label style={{display: 'block', marginBottom: '8px'}}>Роль</label>
                            <Select
                                size="m"
                                placeholder="Выберите роль"
                                value={[formik.values.role]}
                                onUpdate={(value: string[]) =>
                                    formik.setFieldValue('role', value[0] as MongoHostRoleEnum)
                                }
                            >
                                {roleOptions}
                            </Select>
                        </div>
                    </HorizontalStack>
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
