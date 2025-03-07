'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Modal, TextInput} from '@gravity-ui/uikit';
import {DomainComponentDTO, OrganizationUnitDTO} from '@/generated/api';
import {domainComponentsApi, organizationUnitsApi} from '@/app/apis';
import {InputField} from '@/components/formik/InputField';

interface OrgCreateFormProps {
    onSubmit: (values: OrganizationUnitDTO) => void;
}

export const OrgCreateForm: React.FC<OrgCreateFormProps> = ({onSubmit}) => {
    const [domainComponents, setDomainComponents] = useState<DomainComponentDTO[]>([]);
    const [parentOuOptions, setParentOuOptions] = useState<OrganizationUnitDTO[]>([]);
    const [selectedParentOuId, setSelectedParentOuId] = useState<string | null>(null);
    const [selectedDcId, setSelectedDcId] = useState<string | null>(null);
    const [isParentModalOpen, setIsParentModalOpen] = useState(false);
    const [isDcModalOpen, setIsDcModalOpen] = useState(false);

    useEffect(() => {
        const fetchDomainComponents = async () => {
            try {
                const response = await domainComponentsApi.getAllDomainComponents();
                setDomainComponents(response.data ?? []);
            } catch (error) {
                console.error('Error fetching domain components:', error);
            }
        };

        fetchDomainComponents();
    }, []);

    useEffect(() => {
        const fetchParentOuOptions = async () => {
            if (selectedDcId) {
                const response = await organizationUnitsApi.getAllOrganizationUnits({
                    dcId: selectedDcId,
                    limit: 5,
                });
                setParentOuOptions(response.data.data ?? []);
            }
        };

        fetchParentOuOptions();
    }, [selectedDcId]);

    const formik = useFormik<OrganizationUnitDTO>({
        initialValues: {
            id: '',
            name: '',
            description: '',
            ownerId: '',
            parentId: '',
            domainComponentId: '',
        },
        validate: (values) => {
            const errors: Partial<OrganizationUnitDTO> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            }
            if (!values.ownerId) {
                errors.ownerId = 'Владелец обязателен';
            }
            if (!values.domainComponentId) {
                errors.domainComponentId = 'Domain Component обязателен';
            }
            return errors;
        },
        onSubmit,
    });

    const handleParentOuChange = (value: string) => {
        setSelectedParentOuId(value);
        formik.setFieldValue('parentOuId', value);
    };

    const handleDcChange = (value: string) => {
        setSelectedDcId(value);
        formik.setFieldValue('domainComponentId', value);
    };

    const handleOpenParentModal = () => {
        setIsParentModalOpen(true);
    };

    const handleCloseParentModal = () => {
        setIsParentModalOpen(false);
    };

    const handleOpenDcModal = () => {
        setIsDcModalOpen(true);
    };

    const handleCloseDcModal = () => {
        setIsDcModalOpen(false);
    };

    const renderParentOuSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Родительский OU</label>
                <TextInput
                    name="parentOuId"
                    value={selectedParentOuId ?? ''}
                    onUpdate={handleParentOuChange}
                    onBlur={formik.handleBlur('parentOuId')}
                    error={formik.touched.parentId ? formik.errors.parentId : undefined}
                    placeholder="Введите или выберите родительский OU"
                />
                <Button view="normal" size="m" onClick={handleOpenParentModal}>
                    Поиск OU
                </Button>
                {isParentModalOpen && (
                    <Modal onOpenChange={handleCloseParentModal}>
                        <h2>Поиск OU</h2>
                        <div>
                            {parentOuOptions.map((ou) => (
                                <div
                                    key={ou.id}
                                    style={{marginBottom: '8px', cursor: 'pointer'}}
                                    onClick={() => handleParentOuChange(ou.id ?? '???')}
                                >
                                    {ou.name} (Владелец: {ou.ownerId})
                                </div>
                            ))}
                        </div>
                        <div>
                            <Button view="normal" onClick={handleCloseParentModal}>
                                Закрыть
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    };

    const renderDcSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Domain Component</label>
                <TextInput
                    name="domainComponentId"
                    value={selectedDcId ?? ''}
                    onUpdate={handleDcChange}
                    onBlur={formik.handleBlur('domainComponentId')}
                    error={
                        formik.touched.domainComponentId
                            ? formik.errors.domainComponentId
                            : undefined
                    }
                    placeholder="Введите или выберите Domain Component"
                />
                <Button view="normal" size="m" onClick={handleOpenDcModal}>
                    Поиск Domain Component
                </Button>
                {isDcModalOpen && (
                    <Modal onOpenChange={handleCloseDcModal}>
                        <h2>Поиск Domain Component</h2>
                        <div>
                            {domainComponents.map((dc) => (
                                <div
                                    key={dc.id}
                                    style={{marginBottom: '8px', cursor: 'pointer'}}
                                    onClick={() => handleDcChange(dc.id ?? '???')}
                                >
                                    {dc.name}
                                </div>
                            ))}
                        </div>
                        <div>
                            <Button view="normal" onClick={handleCloseDcModal}>
                                Закрыть
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Создание новой Organization Unit</h1>
            <form onSubmit={formik.handleSubmit}>
                <InputField
                    label="Название"
                    name="name"
                    value={formik.values.name}
                    onChange={(value) => formik.setFieldValue('name', value)}
                    onBlur={formik.handleBlur('name')}
                    error={formik.touched.name ? formik.errors.name : undefined}
                    placeholder="Введите название"
                />
                <InputField
                    label="Владелец"
                    name="ownerId"
                    value={formik.values.ownerId ?? ''}
                    onChange={(value) => formik.setFieldValue('ownerId', value)}
                    onBlur={formik.handleBlur('ownerId')}
                    error={formik.touched.ownerId ? formik.errors.ownerId : undefined}
                    placeholder="Введите владельца"
                />
                <InputField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                />
                {renderDcSelector()}
                {selectedDcId && renderParentOuSelector()}
                <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Создание...' : 'Создать OU'}
                </Button>
            </form>
        </div>
    );
};
