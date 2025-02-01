'use client';

import React from 'react';
import {useFormik} from 'formik';
import {Button} from '@gravity-ui/uikit';
import {useRouter} from 'next/navigation';
import {ProjectsApi} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {NumberField} from '@/components/formik/NumberField';

interface ProjectFormValues {
    name: string;
    description: string;
    parentId?: string;
    ownerId: string;
}

export default function CreateProjectPage() {
    const router = useRouter();

    const formik = useFormik<ProjectFormValues>({
        initialValues: {
            name: '',
            description: '',
            parentId: '',
            ownerId: '',
        },
        validate: (values) => {
            const errors: Partial<ProjectFormValues> = {};

            if (!values.name) {
                errors.name = 'Название обязательно';
            } else if (values.name.length > 100) {
                errors.name = 'Название не должно превышать 100 символов';
            }

            if (!values.description) {
                errors.description = 'Описание обязательно';
            } else if (values.description.length > 500) {
                errors.description = 'Описание не должно превышать 500 символов';
            }

            if (!values.ownerId) {
                errors.ownerId = 'Владелец обязателен';
            }

            return errors;
        },
        onSubmit: async (values) => {
            try {
                const projectsApi = new ProjectsApi();
                await projectsApi.createProject({projectDTO: values});
                router.push('/projects'); // Перенаправление на страницу проектов после успешного создания
            } catch (error) {
                console.error('Ошибка при создании проекта:', error);
            }
        },
    });

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Создание нового проекта</h1>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange('name')}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name && formik.errors.name}
                    placeholder="Введите название проекта"
                />
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange('description')}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description && formik.errors.description}
                    placeholder="Введите описание проекта"
                />
                <InputField
                    label="Родительский проект (опционально)"
                    name="parentId"
                    value={formik.values.parentId || ''}
                    onChange={formik.handleChange('parentId')}
                    onBlur={formik.handleBlur('parentId')}
                    error={formik.touched.parentId && formik.errors.parentId}
                    placeholder="Введите ID родительского проекта"
                />
                <NumberField
                    label="ID владельца"
                    name="ownerId"
                    value={Number(formik.values.ownerId)}
                    onChange={(value) => formik.setFieldValue('ownerId', value)}
                    onBlur={formik.handleBlur('ownerId')}
                    error={formik.touched.ownerId && formik.errors.ownerId}
                    placeholder="Введите ID владельца"
                />
                <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Создание...' : 'Создать проект'}
                </Button>
            </form>
        </div>
    );
}
