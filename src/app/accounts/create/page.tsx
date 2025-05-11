'use client';

import React, {useState} from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import {useFormik} from 'formik';
import {Button} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {InputField} from '@/components/formik/InputField';
import {OrganizationUnitSelector} from '@/components/formik/OrganizationUnitSelector';
import {accountsApi, organizationUnitsApi} from '@/app/apis';

interface AccountFormValues {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    organizationUnitId?: string;
}

export default function CreateAccountPage() {
    const router = useRouter();
    const [selectedOrganizationUnitId, setSelectedOrganizationUnitId] = useState<string | null>(
        null,
    );

    const formik = useFormik<AccountFormValues>({
        initialValues: {
            username: '',
            password: '',
            email: '',
            firstName: '',
            lastName: '',
            organizationUnitId: '',
        },
        validate: (values) => {
            const errors: Partial<AccountFormValues> = {};

            if (!values.username) {
                errors.username = 'Имя пользователя обязательно';
            }

            if (!values.password) {
                errors.password = 'Пароль обязателен';
            }

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
        onSubmit: async (values) => {
            try {
                const response = await accountsApi.createAccount({accountPostDTO: values});
                if (selectedOrganizationUnitId && response.data.id) {
                    await organizationUnitsApi.addAccountToOrganizationUnit({
                        ouId: selectedOrganizationUnitId,
                        accountId: response.data.id,
                    });
                }

                router.push('/accounts'); // Перенаправление на страницу аккаунтов после успешного создания
            } catch (error) {
                console.error('Ошибка при создании аккаунта:', error);
            }
        },
    });

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Создание нового аккаунта</h1>
            <form onSubmit={formik.handleSubmit}>
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
                    label="Пароль"
                    name="password"
                    value={formik.values.password}
                    onChange={(value) => formik.setFieldValue('password', value)}
                    onBlur={formik.handleBlur('password')}
                    error={formik.touched.password ? formik.errors.password : undefined}
                    placeholder="Введите пароль"
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
                <InputField
                    label="Имя"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={(value) => formik.setFieldValue('firstName', value)}
                    onBlur={formik.handleBlur('firstName')}
                    error={formik.touched.firstName ? formik.errors.firstName : undefined}
                    placeholder="Введите имя"
                />
                <InputField
                    label="Фамилия"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={(value) => formik.setFieldValue('lastName', value)}
                    onBlur={formik.handleBlur('lastName')}
                    error={formik.touched.lastName ? formik.errors.lastName : undefined}
                    placeholder="Введите фамилию"
                />
                <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>
                        Организационная единица
                    </label>
                    <OrganizationUnitSelector
                        onSelect={(organizationUnitId) => {
                            setSelectedOrganizationUnitId(organizationUnitId);
                            formik.setFieldValue('organizationUnitId', organizationUnitId);
                        }}
                    />
                </div>
                <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Создание...' : 'Создать аккаунт'}
                </Button>
            </form>
        </div>
    );
}
