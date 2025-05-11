'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button} from '@gravity-ui/uikit';
import {AccountDTO} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

interface AccountFormProps {
    initialValue?: AccountDTO;
    onSubmit: (values: AccountFormDTO) => void;
    closeAction: () => void;
}

export interface AccountData {
    description: string;
    phoneNumber: string;
    socialLinks: {[key: string]: string};
    jobTitle: string;
    workSchedule: string;
    dateOfBirth: string;
    city: string;
}

export type AccountFormDTO = AccountDTO & {
    anyData: AccountData;
};

function mapDTOtoForm(data?: AccountDTO): AccountFormDTO {
    return {
        id: data?.id ?? '',
        username: data?.username ?? '',
        password: data?.password ?? '',
        email: data?.email ?? '',
        firstName: data?.firstName ?? '',
        lastName: data?.lastName ?? '',
        anyData: {
            phoneNumber: data?.data?.phoneNumber?.toString() ?? '',
            jobTitle: data?.data?.jobTitle?.toString() ?? '',
            workSchedule: data?.data?.workSchedule?.toString() ?? '',
            dateOfBirth: data?.data?.dateOfBirth?.toString() ?? '',
            city: data?.data?.city?.toString() ?? '',
            description: data?.data?.description?.toString() ?? '',
            socialLinks: (data?.data?.socialLinks as {[key: string]: string}) ?? {},
        },
        createdAt: data?.createdAt ?? '',
        updatedAt: data?.updatedAt ?? '',
    };
}

// eslint-disable-next-line complexity
export const AccountForm: React.FC<AccountFormProps> = ({initialValue, onSubmit, closeAction}) => {
    // const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    //     initialValue?.id ?? null,
    // );
    const [formData, setFormData] = useState<AccountFormDTO>(mapDTOtoForm(initialValue));

    const formik = useFormik<AccountFormDTO>({
        initialValues: formData,
        validate: (values) => {
            const errors: Partial<AccountDTO> = {};
            if (!values.username) {
                errors.username = 'Имя пользователя обязательно';
            }
            // if (!values.password) {
            //     errors.password = 'Пароль обязателен';
            // }
            if (!values.email) {
                errors.email = 'Email обязателен';
            } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
                errors.email = 'Некорректный email';
            }
            if (!values.firstName) {
                errors.firstName = 'Имя обязательно';
            }
            if (!values.lastName) {
                errors.lastName = 'Фамилия обязательна';
            }
            return errors;
        },
        onSubmit,
    });

    useEffect(() => {
        if (initialValue) {
            setFormData(mapDTOtoForm(initialValue));
        }
    }, [initialValue]);

    return (
        <div style={{padding: '20px', margin: '0 auto'}}>
            <h1>{initialValue ? 'Редактирование аккаунта' : 'Создание нового аккаунта'}</h1>
            <form onSubmit={formik.handleSubmit}>
                <h3>Основная информация</h3>
                <HorizontalStack>
                    <div>
                        <InputField
                            label="Имя пользователя"
                            name="username"
                            value={formik.values.username}
                            onChange={(value) => formik.setFieldValue('username', value)}
                            onBlur={formik.handleBlur('username')}
                            error={formik.touched.username ? formik.errors.username : undefined}
                            placeholder="Введите имя пользователя"
                        />
                        <InputField
                            label="Имя"
                            name="firstName"
                            value={formik.values.firstName ?? ''}
                            onChange={(value) => formik.setFieldValue('firstName', value)}
                            onBlur={formik.handleBlur('firstName')}
                            error={formik.touched.firstName ? formik.errors.firstName : undefined}
                            placeholder="Введите имя"
                        />
                        <InputField
                            label="Email"
                            name="email"
                            value={formik.values.email}
                            onChange={(value) => formik.setFieldValue('email', value)}
                            onBlur={formik.handleBlur('email')}
                            error={formik.touched.email ? formik.errors.email : undefined}
                            placeholder="Введите email"
                        />
                    </div>
                    <Box marginLeft="20px">
                        <InputField
                            label="Пароль"
                            name="password"
                            value={formik.values.password ?? ''}
                            onChange={(value) => formik.setFieldValue('password', value)}
                            onBlur={formik.handleBlur('password')}
                            error={formik.touched.password ? formik.errors.password : undefined}
                            placeholder="Введите пароль"
                            type="password"
                        />
                        <InputField
                            label="Фамилия"
                            name="lastName"
                            value={formik.values.lastName ?? ''}
                            onChange={(value) => formik.setFieldValue('lastName', value)}
                            onBlur={formik.handleBlur('lastName')}
                            error={formik.touched.lastName ? formik.errors.lastName : undefined}
                            placeholder="Введите фамилию"
                        />
                    </Box>
                </HorizontalStack>
                <h3>Дополнительная информация</h3>
                <TextAreaField
                    label="О себе"
                    name="description"
                    value={formik.values.anyData?.description ?? ''}
                    onChange={(value) => formik.setFieldValue('anyData.description', value)}
                    onBlur={formik.handleBlur('anyData.description')}
                    error={
                        formik.touched.anyData?.description
                            ? formik.errors.anyData?.description
                            : undefined
                    }
                    placeholder="Введите описание"
                />
                <HorizontalStack>
                    <div>
                        <InputField
                            label="Режим работы"
                            name="workSchedule"
                            value={formik.values.anyData.workSchedule ?? ''}
                            onChange={(value) =>
                                formik.setFieldValue('anyData.workSchedule', value)
                            }
                            onBlur={formik.handleBlur('anyData.workSchedule')}
                            error={
                                formik.touched.anyData?.workSchedule
                                    ? formik.errors.anyData?.workSchedule
                                    : undefined
                            }
                            placeholder="Введите режим работы"
                        />
                        <InputField
                            label="Штатная должность"
                            name="jobTitle"
                            value={formik.values.anyData.jobTitle ?? ''}
                            onChange={(value) => formik.setFieldValue('anyData.jobTitle', value)}
                            onBlur={formik.handleBlur('anyData.jobTitle')}
                            error={
                                formik.touched.anyData?.jobTitle
                                    ? formik.errors.anyData?.jobTitle
                                    : undefined
                            }
                            placeholder="Введите штатную должность"
                        />
                        <InputField
                            label="Дата рождения"
                            name="dateOfBirth"
                            value={formik.values.anyData.dateOfBirth ?? ''}
                            onChange={(value) => formik.setFieldValue('anyData.dateOfBirth', value)}
                            onBlur={formik.handleBlur('anyData.dateOfBirth')}
                            error={
                                formik.touched.anyData?.dateOfBirth
                                    ? formik.errors.anyData?.dateOfBirth
                                    : undefined
                            }
                            placeholder="Введите дату рождения"
                        />
                    </div>
                    <Box marginLeft="20px">
                        <InputField
                            label="Город проживания"
                            name="city"
                            value={formik.values.anyData.city ?? ''}
                            onChange={(value) => formik.setFieldValue('anyData.city', value)}
                            onBlur={formik.handleBlur('anyData.city')}
                            error={
                                formik.touched.anyData?.city
                                    ? formik.errors.anyData?.city
                                    : undefined
                            }
                            placeholder="Введите город проживания"
                        />
                        <InputField
                            label="Ссылка на соцсети (Вконтакте)"
                            name="vk"
                            value={formik.values.anyData.socialLinks?.vk ?? ''}
                            onChange={(value) =>
                                formik.setFieldValue('anyData.socialLinks.vk', value)
                            }
                            onBlur={formik.handleBlur('anyData.socialLinks.vk')}
                            error={
                                formik.touched.anyData?.socialLinks?.vk
                                    ? formik.errors.anyData?.socialLinks?.vk
                                    : undefined
                            }
                            placeholder="Введите ссылку на ВКонтакте"
                        />
                        <InputField
                            label="Ссылка на LinkedIn"
                            name="linkedin"
                            value={formik.values.anyData.socialLinks?.linkedin ?? ''}
                            onChange={(value) =>
                                formik.setFieldValue('anyData.socialLinks.linkedin', value)
                            }
                            onBlur={formik.handleBlur('anyData.socialLinks.linkedin')}
                            error={
                                formik.touched.anyData?.socialLinks?.linkedin
                                    ? formik.errors.anyData?.socialLinks?.linkedin
                                    : undefined
                            }
                            placeholder="Введите ссылку на LinkedIn"
                        />
                    </Box>
                </HorizontalStack>
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
                </HorizontalStack>
            </form>
        </div>
    );
};
