'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, SegmentedRadioGroup, Select, Text} from '@gravity-ui/uikit';
import {ResourcePresetCard} from '@/components/ResourcePresetCard';
import {mdbResourcePresetsApi} from '@/app/apis';
import {
    InitMongoDatabase,
    InitMongoUser,
    V1ProjectResponse,
    V1ResourcePresetResponse,
    V1ResourcePresetResponseTypeEnum,
} from '@/generated/api-mdb';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {AccountDTO} from '@/generated/api';
import {useAuth} from '@/context/AuthContext';
import {AccountSelector} from '@/components/AccountSelector';
import {ProjectSelector} from '@/components/ProjectsSelector';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';

export interface ClusterFormValues {
    name: string;
    description: string;
    projectId: string;
    presetId: string;
    storageClass: string;
    storage: number;
    replicas: number;
    ownerId: string;
    database: InitMongoDatabase;
    user: InitMongoUser;
}

const V1StorageClassTypeEnum = {
    HDD: 'HDD',
    SSD: 'SSD',
    NVME: 'NVME',
} as const;

const DEFAULT_PRESET = V1ResourcePresetResponseTypeEnum.Standard;

export interface ClusterCreateFormProps {
    createAction: (data: ClusterFormValues) => void;
    cancelAction: () => void;
}

export const ClusterCreateForm: React.FC<ClusterCreateFormProps> = ({
    createAction,
    cancelAction,
}) => {
    const {user} = useAuth();
    const [resourcePresets, setResourcePresets] = useState<V1ResourcePresetResponse[]>([]);
    const [filteredPresets, setFilteredPresets] = useState<V1ResourcePresetResponse[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<V1ResourcePresetResponse | null>(null);

    useEffect(() => {
        mdbResourcePresetsApi
            .listResourcePresets()
            .then((response) => {
                setResourcePresets(response.data.resourcePresets);
                // Установка значений по умолчанию
                const presetsByType = response.data.resourcePresets.filter(
                    (preset) => preset.type === DEFAULT_PRESET,
                );
                setFilteredPresets(presetsByType);
            })
            .catch((error) => console.error('Error fetching resource presets:', error));
    }, []);

    const formik = useFormik<ClusterFormValues>({
        initialValues: {
            name: '',
            description: '',
            projectId: '',
            presetId: '',
            storageClass: '',
            storage: 0,
            replicas: 1,
            ownerId: user?.account.id ?? '',
            database: {name: ''},
            user: {name: '', password: ''},
        },
        validate: (values) => {
            const errors: Partial<ClusterFormValues> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            } else if (values.name.length > 100) {
                errors.name = 'Название не должно превышать 100 символов';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            if (!values.presetId) {
                errors.presetId = 'Выбор пресета обязателен';
            }
            if (!values.storageClass) {
                errors.storageClass = 'Выбор класса хранения обязателен';
            }
            if (!values.ownerId) {
                errors.ownerId = 'Владелец кластера обязателен';
            }
            if (!values.replicas || values.replicas <= 0) {
                errors.replicas = 1;
            }
            if (!values.database) {
                errors.database = {name: 'Первая база данных обязательна'};
            }
            if (!values.user.name && !values.user.password) {
                errors.user = {name: 'Имя обязательно', password: 'Пароль обязателен'};
            } else if (!values.user.name) {
                errors.user = {name: 'Имя обязательно', password: ''};
            } else if (!values.user.password) {
                errors.user = {name: '', password: 'Пароль обязателен'};
            }
            return errors;
        },
        onSubmit: createAction,
    });

    const handleTypeChange = (value: string) => {
        setSelectedPreset(null);
        const presetsByType = resourcePresets.filter((preset) => preset.type === value);
        setFilteredPresets(presetsByType);
    };

    const handlePresetSelect = (preset: V1ResourcePresetResponse) => {
        setSelectedPreset(preset);
        formik.setFieldValue('presetId', preset.id);
    };

    const handleProjectSelect = (project: V1ProjectResponse) => {
        // setSelectedProject(project);
        formik.setFieldValue('projectId', project.id);
    };

    const handleOwnerSelect = (account: AccountDTO) => {
        // setSelectedOwner(account);
        formik.setFieldValue('ownerId', account.id);
    };

    const typeOptions = Object.values(V1ResourcePresetResponseTypeEnum).map((type) => (
        <SegmentedRadioGroup.Option key={type} value={type}>
            {type}
        </SegmentedRadioGroup.Option>
    ));

    const storageClassOptions = Object.values(V1StorageClassTypeEnum).map((storageClass) => (
        <Select.Option key={storageClass} value={storageClass}>
            {storageClass}
        </Select.Option>
    ));

    return (
        <div style={{maxWidth: '600px'}}>
            <Text variant="header-1">Создание нового кластера</Text>
            <form onSubmit={formik.handleSubmit}>
                <div style={{marginTop: '16px', marginBottom: '16px'}}>
                    <Text variant="subheader-2">Метаданные</Text>
                    <InputField
                        label="Название"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange('name')}
                        onBlur={formik.handleBlur('name')}
                        error={formik.touched.name ? formik.errors.name : undefined}
                        placeholder="Введите название кластера"
                    />
                    <TextAreaField
                        label="Описание"
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange('description')}
                        onBlur={formik.handleBlur('description')}
                        error={formik.touched.description ? formik.errors.description : undefined}
                        placeholder="Введите описание кластера"
                    />
                    <ProjectSelector
                        onProjectSelect={handleProjectSelect}
                        label="В каком проекте создать кластер?"
                        header="Поиск проекта для создания кластера"
                    />
                    <AccountSelector
                        onAccountSelect={handleOwnerSelect}
                        label="Кто владелец кластера?"
                        header="Поиск владельца кластера"
                    />
                </div>
                <div style={{marginBottom: '16px'}}>
                    <Text variant="subheader-2">Класс хоста</Text>
                    <Box marginTop={8} marginBottom={8}>
                        <HorizontalStack align="center" gap={10}>
                            <Text variant="body-1">Тип</Text>
                            <SegmentedRadioGroup
                                name="presetType"
                                defaultValue={DEFAULT_PRESET}
                                size="s"
                                onUpdate={(value: string) => handleTypeChange(value)}
                            >
                                {typeOptions}
                            </SegmentedRadioGroup>
                        </HorizontalStack>
                    </Box>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                        {filteredPresets.map((preset) => (
                            <ResourcePresetCard
                                key={preset.id}
                                preset={preset}
                                onSelect={handlePresetSelect}
                                isActive={selectedPreset?.id === preset.id}
                            />
                        ))}
                    </div>
                    {formik.touched.presetId && formik.errors.presetId && (
                        <Text variant="body-1" color="danger" style={{marginTop: '4px'}}>
                            {formik.errors.presetId}
                        </Text>
                    )}
                </div>
                <div style={{marginBottom: '16px'}}>
                    <Text variant="subheader-2">Настройка хранилища</Text>
                    <Box marginTop={8} marginBottom={8}>
                        <HorizontalStack align="center" gap={10}>
                            <Text variant="body-1">Класс хранилища</Text>
                            <Select
                                size="m"
                                placeholder="Выберите класс хранилища"
                                value={[formik.values.storageClass]}
                                onUpdate={(value: string[]) =>
                                    formik.setFieldValue('storageClass', value[0])
                                }
                            >
                                {storageClassOptions}
                            </Select>
                        </HorizontalStack>
                    </Box>
                    <InputField
                        label="Хранилище (в мегабайтах)"
                        name="storage"
                        value={formik.values.storage.toString()}
                        onChange={(value) => formik.setFieldValue('storage', parseInt(value, 10))}
                        onBlur={formik.handleBlur('storage')}
                        error={formik.touched.storage ? formik.errors.storage : undefined}
                        placeholder="Введите размер хранилища в мегабайтах"
                        type="number"
                        endContent="MB"
                    />
                </div>
                <div style={{marginBottom: '16px'}}>
                    <InputField
                        label="Количество реплик"
                        name="replicas"
                        value={formik.values.replicas.toString()}
                        onChange={(value) => formik.setFieldValue('replicas', parseInt(value, 10))}
                        onBlur={formik.handleBlur('replicas')}
                        error={formik.touched.replicas ? formik.errors.replicas : undefined}
                        placeholder="Введите количество реплик"
                        type="number"
                    />
                </div>
                <Text variant="subheader-2">Создание новой базы данных</Text>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.database.name}
                    onChange={formik.handleChange('database.name')}
                    onBlur={formik.handleBlur('database.name')}
                    error={formik.touched.database?.name ? formik.errors.database?.name : undefined}
                    placeholder="Введите название базы данных"
                />
                <Text variant="subheader-2">Создание нового пользователя</Text>
                <InputField
                    label="Имя пользователя"
                    name="name"
                    value={formik.values.user.name}
                    onChange={formik.handleChange('user.name')}
                    onBlur={formik.handleBlur('user.name')}
                    error={formik.touched.user?.name ? formik.errors.user?.name : undefined}
                    placeholder="Введите имя пользователя"
                />
                <InputField
                    label="Пароль"
                    name="password"
                    value={formik.values.user.password}
                    onChange={formik.handleChange('user.password')}
                    onBlur={formik.handleBlur('user.password')}
                    error={formik.touched.user?.password ? formik.errors.user?.password : undefined}
                    placeholder="Введите пароль"
                    type="password"
                />
                <HorizontalStack gap={20}>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Создание...' : 'Создать кластер'}
                    </Button>
                    <Button
                        view="normal"
                        size="l"
                        disabled={formik.isSubmitting}
                        onClick={cancelAction}
                    >
                        {'Отменить'}
                    </Button>
                </HorizontalStack>
            </form>
        </div>
    );
};
