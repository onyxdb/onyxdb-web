'use client';
import React, {useEffect, useState} from 'react';
import {FormikErrors, useFormik} from 'formik';
import {Button, Checkbox, SegmentedRadioGroup, Select, Text} from '@gravity-ui/uikit';
import {ResourcePresetCard} from '@/components/ResourcePresetCard';
import {mdbQuotasApi, mdbResourcePresetsApi} from '@/app/apis';
import {
    AccountDTO,
    MongoClusterDTO,
    MongoDatabaseDTO,
    MongoUserDTO,
    ProjectDTO,
    Quota,
    Resource,
    ResourceUnitEnum,
    SimulateMongoDBQuotasUsageRequest,
    V1ResourcePresetResponse,
    V1ResourcePresetResponseTypeEnum,
} from '@/generated/api';
import {InputField} from '@/components/formik/InputField';
import {TextAreaField} from '@/components/formik/TextAreaField';
import {AccountSelector} from '@/components/AccountSelector';
import {ProjectSelector} from '@/components/ProjectsSelector';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {BytesGB, CoresCPU, ResourceInputField, ResourceUnit} from '@/components/ResourceInputField';
import {QuotaSimulationResult} from '@/components/QuotaSimulationResult';

export interface ClusterFormValues {
    name: string;
    description: string;
    projectId: string;
    presetId: string;
    storageClass: string;
    storage: number;
    replicas: number;
    ownerId: string;
    database: MongoDatabaseDTO;
    user: MongoUserDTO;
    backupIsEnabled: boolean;
    backupSchedule: string;
}

const V1StorageClassTypeEnum = {
    HDD: 'HDD',
    SSD: 'SSD',
    NVME: 'NVME',
} as const;

const DEFAULT_PRESET = V1ResourcePresetResponseTypeEnum.Standard;

export interface ClusterCreateFormProps {
    initialValues?: MongoClusterDTO;
    submitAction: (data: ClusterFormValues) => void;
    cancelAction: () => void;
}

// eslint-disable-next-line complexity
export const ClusterForm: React.FC<ClusterCreateFormProps> = ({
    initialValues,
    submitAction,
    cancelAction,
}) => {
    const [resourcePresets, setResourcePresets] = useState<V1ResourcePresetResponse[]>([]);
    const [filteredPresets, setFilteredPresets] = useState<V1ResourcePresetResponse[]>([]);
    const [selectedPreset, setSelectedPreset] = useState<V1ResourcePresetResponse | null>(null);
    const [simulationResult, setSimulationResult] = useState<Quota[] | null>(null);
    const [isSimulationValid, setIsSimulationValid] = useState<boolean>(false);

    useEffect(() => {
        mdbResourcePresetsApi
            .listResourcePresets()
            .then((response) => {
                setResourcePresets(response.data.resourcePresets);
                const presetsByType = response.data.resourcePresets.filter(
                    (preset) => preset.type === DEFAULT_PRESET,
                );
                setFilteredPresets(presetsByType);
                if (initialValues) {
                    setSelectedPreset(
                        response.data.resourcePresets.find(
                            (preset) => preset.id === initialValues.config.resources.presetId,
                        ) ?? null,
                    );
                }
            })
            .catch((error) => console.error('Error fetching resource presets:', error));
    }, [initialValues]);

    const isEditMode = Boolean(initialValues);

    const formik = useFormik<ClusterFormValues>({
        initialValues: {
            name: initialValues?.name || '',
            description: initialValues?.description || '',
            projectId: initialValues?.projectId || '',
            presetId: initialValues?.config.resources.presetId || '',
            storageClass: initialValues?.config.resources.storageClass || '',
            storage: initialValues?.config.resources.storage || 0,
            replicas: initialValues?.config.replicas || 1,
            ownerId: '',
            database: {name: ''},
            user: {name: '', password: ''},
            backupIsEnabled: true,
            backupSchedule: '0 0 * * * *',
        },
        validate: (values) => {
            const errors: Partial<FormikErrors<ClusterFormValues>> = {};
            if (!values.name && !isEditMode) {
                errors.name = 'Название обязательно';
            } else if (values.name.length > 100 && !isEditMode) {
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
            if (!values.ownerId && !isEditMode) {
                errors.ownerId = 'Владелец кластера обязателен';
            }
            if (!values.replicas || values.replicas <= 0) {
                errors.replicas = 'Количество реплик должно быть больше 0';
            }
            if (!isEditMode) {
                if (!values.database.name) {
                    errors.database = {name: 'Первая база данных обязательна'};
                }
                if (!values.user.name && !values.user.password) {
                    errors.user = {name: 'Имя обязательно', password: 'Пароль обязателен'};
                } else if (!values.user.name) {
                    errors.user = {name: 'Имя обязательно', password: ''};
                } else if (!values.user.password) {
                    errors.user = {name: '', password: 'Пароль обязателен'};
                }
            }
            return errors;
        },
        onSubmit: (values) => {
            submitAction(values);
        },
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

    const handleProjectSelect = (project: ProjectDTO) => {
        formik.setFieldValue('projectId', project.id);
    };

    const handleOwnerSelect = (account: AccountDTO | null) => {
        formik.setFieldValue('ownerId', account?.id ?? '');
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

    const handleSimulateQuotas = async () => {
        if (
            !formik.values.projectId ||
            !formik.values.presetId ||
            !formik.values.storageClass ||
            !formik.values.storage ||
            !formik.values.replicas
        ) {
            formik.setErrors({
                projectId: formik.values.projectId ? undefined : 'ID проекта обязателен',
                presetId: formik.values.presetId ? undefined : 'Выбор пресета обязателен',
                storageClass: formik.values.storageClass
                    ? undefined
                    : 'Выбор класса хранения обязателен',
                storage: formik.values.storage > 0 ? undefined : 'Хранилище должно быть больше 0',
                replicas:
                    formik.values.replicas > 0
                        ? undefined
                        : 'Количество реплик должно быть больше 0',
            });
            return;
        }

        try {
            const simulateRequest: SimulateMongoDBQuotasUsageRequest = {
                projectId: formik.values.projectId,
                config: {
                    version: '',
                    backup: {
                        isEnabled: formik.values.backupIsEnabled,
                        schedule: formik.values.backupSchedule,
                    },
                    resources: {
                        presetId: formik.values.presetId,
                        storageClass: formik.values.storageClass,
                        storage: formik.values.storage,
                    },
                    replicas: formik.values.replicas,
                },
            };
            const simulationResponse = await mdbQuotasApi.simulateMongoDbQuotasUsage({
                simulateMongoDBQuotasUsageRequest: simulateRequest,
            });
            const quotas = simulationResponse.data.quotas;
            setSimulationResult(quotas);

            // Проверка, что все free больше 0
            const isValid = quotas.every((quota) => quota.free >= 0);
            setIsSimulationValid(isValid);
        } catch (error) {
            console.error('Error simulating quotas:', error);
            setSimulationResult(null);
            setIsSimulationValid(false);
        }
    };

    const getUnitByResource = (resource: Resource): ResourceUnit => {
        if (resource.unit === ResourceUnitEnum.Cores) {
            return CoresCPU;
        }
        return BytesGB;
    };

    return (
        <div style={{display: 'flex', gap: '20px'}}>
            <div style={{flex: 1, maxWidth: '600px'}}>
                <Text variant="header-1">
                    {isEditMode ? 'Обновление кластера' : 'Создание нового кластера'}
                </Text>
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
                            disabled={isEditMode}
                        />
                        <TextAreaField
                            label="Описание"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange('description')}
                            onBlur={formik.handleBlur('description')}
                            error={
                                formik.touched.description ? formik.errors.description : undefined
                            }
                            placeholder="Введите описание кластера"
                        />
                        <ProjectSelector
                            initialValueId={initialValues?.projectId}
                            selectProjectAction={handleProjectSelect}
                            label="В каком проекте создать кластер?"
                            header="Поиск проекта для создания кластера"
                            disabled={isEditMode}
                        />
                        <AccountSelector
                            selectAccountAction={handleOwnerSelect}
                            label="Кто владелец кластера?"
                            header="Поиск владельца кластера"
                            disabled={isEditMode}
                        />
                    </div>
                    <div style={{marginBottom: '16px'}}>
                        <Text variant="subheader-2">Класс хоста</Text>
                        <Box marginTop={8} marginBottom={8}>
                            <HorizontalStack align="center" gap={10}>
                                <Text variant="body-1">Тип</Text>
                                <SegmentedRadioGroup
                                    name="presetType"
                                    defaultValue={selectedPreset?.type ?? DEFAULT_PRESET}
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
                                    // disabled={isEditMode}
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
                                    errorMessage={
                                        formik.touched.storageClass && formik.errors.storageClass
                                    }
                                    validationState={
                                        formik.touched.storageClass &&
                                        formik.errors.storageClass &&
                                        formik.errors.storageClass?.length === 0
                                            ? 'invalid'
                                            : undefined
                                    }
                                    disabled={isEditMode}
                                >
                                    {storageClassOptions}
                                </Select>
                            </HorizontalStack>
                        </Box>
                        <ResourceInputField
                            name="storage"
                            value={formik.values.storage}
                            changeAction={(value: number) => {
                                formik.setFieldValue('storage', value);
                            }}
                            onBlur={formik.handleBlur('storage')}
                            error={formik.touched.storage ? formik.errors.storage : undefined}
                            placeholder="Введите размер хранилища"
                            unitType={ResourceUnitEnum.Bytes}
                            disabled={isEditMode}
                        />
                    </div>
                    <div style={{marginBottom: '16px'}}>
                        <InputField
                            label="Количество реплик"
                            name="replicas"
                            value={formik.values.replicas.toString()}
                            onChange={(value) =>
                                formik.setFieldValue('replicas', parseInt(value, 10))
                            }
                            onBlur={formik.handleBlur('replicas')}
                            error={formik.touched.replicas ? formik.errors.replicas : undefined}
                            placeholder="Введите количество реплик"
                            type="number"
                        />
                    </div>
                    <Box marginTop={16} marginBottom={16}>
                        <Checkbox
                            size="l"
                            checked={formik.values.backupIsEnabled}
                            onUpdate={(value) => formik.setFieldValue('backupIsEnabled', value)}
                        >
                            Нужно ли автосоздание бекапов?
                        </Checkbox>
                    </Box>
                    {formik.values.backupIsEnabled && (
                        <InputField
                            label="График создания бекапов"
                            name="backupSchedule"
                            value={formik.values.backupSchedule.toString()}
                            onChange={(value) =>
                                formik.setFieldValue('backupSchedule', parseInt(value, 10))
                            }
                            onBlur={formik.handleBlur('backupSchedule')}
                            error={
                                formik.touched.backupSchedule
                                    ? formik.errors.backupSchedule
                                    : undefined
                            }
                            placeholder="<Минуты> <Часы> <Дни_месяца> <Месяцы> <Дни_недели> <Годы>"
                        />
                    )}
                    {!isEditMode && (
                        <div>
                            <Text variant="subheader-2">Создание новой базы данных</Text>
                            <InputField
                                label="Название"
                                name="database.name"
                                value={formik.values.database.name}
                                onChange={formik.handleChange('database.name')}
                                onBlur={formik.handleBlur('database.name')}
                                error={
                                    formik.touched.database?.name
                                        ? formik.errors.database?.name
                                        : undefined
                                }
                                placeholder="Введите название базы данных"
                                disabled={isEditMode}
                            />
                            <Text variant="subheader-2">Создание нового пользователя</Text>
                            <InputField
                                label="Имя пользователя"
                                name="user.name"
                                value={formik.values.user.name}
                                onChange={formik.handleChange('user.name')}
                                onBlur={formik.handleBlur('user.name')}
                                error={
                                    formik.touched.user?.name ? formik.errors.user?.name : undefined
                                }
                                placeholder="Введите имя пользователя"
                                disabled={isEditMode}
                            />
                            <InputField
                                label="Пароль"
                                name="user.password"
                                value={formik.values.user.password}
                                onChange={formik.handleChange('user.password')}
                                onBlur={formik.handleBlur('user.password')}
                                error={
                                    formik.touched.user?.password
                                        ? formik.errors.user?.password
                                        : undefined
                                }
                                placeholder="Введите пароль"
                                type="password"
                                disabled={isEditMode}
                            />
                        </div>
                    )}
                    <HorizontalStack gap={20}>
                        <Button
                            view="action"
                            size="l"
                            onClick={handleSimulateQuotas}
                            disabled={formik.isSubmitting}
                        >
                            Симулировать
                        </Button>
                        <Button
                            type="submit"
                            view={isSimulationValid ? 'outlined-success' : 'normal'}
                            size="l"
                            disabled={formik.isSubmitting || !isSimulationValid}
                        >
                            {/* eslint-disable-next-line no-nested-ternary */}
                            {formik.isSubmitting
                                ? isEditMode
                                    ? 'Обновление...'
                                    : 'Создание...'
                                : isEditMode
                                  ? 'Обновить кластер'
                                  : 'Создать кластер'}
                        </Button>
                        <Button
                            view="normal"
                            size="l"
                            disabled={formik.isSubmitting}
                            onClick={cancelAction}
                        >
                            Отменить
                        </Button>
                    </HorizontalStack>
                </form>
            </div>
            {simulationResult && (
                <div
                    style={{
                        flex: 1,
                        position: 'sticky',
                        top: '20px',
                        padding: '20px',
                        backgroundColor: 'var(--g-color-bg)',
                    }}
                >
                    <Text variant="header-1">Результат симуляции квот</Text>
                    <div style={{marginTop: '16px'}}>
                        {simulationResult.map((quota) => (
                            <Box key={quota.resource.id} marginTop="16px">
                                <QuotaSimulationResult
                                    title={quota.resource.description}
                                    quota={quota}
                                    unit={getUnitByResource(quota.resource)}
                                />
                            </Box>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
