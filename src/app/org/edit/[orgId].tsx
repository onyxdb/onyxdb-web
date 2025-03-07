'use client';

import React, {useEffect, useState} from 'react';
import {organizationUnitsApi} from '@/app/apis';
import {OrganizationUnitDTO} from '@/generated/api';
import {usePathname, useRouter} from 'next/navigation';
import {Button, Modal, TextInput} from '@gravity-ui/uikit';
import {useFormik} from 'formik';

interface OrgEditPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function OrgEditPage({}: OrgEditPageProps) {
    const [orgUnit, setOrgUnit] = useState<OrganizationUnitDTO | null>(null);
    const [parentOuOptions, setParentOuOptions] = useState<OrganizationUnitDTO[]>([]);
    const [selectedParentOuId, setSelectedParentOuId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    // const {permissions} = usePermissions();

    const orgId = pathname.split('/').pop() ?? '';

    useEffect(() => {
        const fetchOrgUnit = async () => {
            try {
                const orgUnitResponse = await organizationUnitsApi.getOrganizationUnitById({
                    ouId: orgId,
                });
                setOrgUnit(orgUnitResponse.data ?? null);
                setSelectedParentOuId(orgUnitResponse.data?.parentId ?? null);
            } catch (error) {
                console.error('Error fetching organization unit:', error);
            }
        };

        fetchOrgUnit();
    }, [orgId]);

    useEffect(() => {
        const fetchParentOuOptions = async () => {
            if (orgUnit?.domainComponentId) {
                const response = await organizationUnitsApi.getAllOrganizationUnits({
                    dcId: orgUnit?.domainComponentId,
                    limit: 5,
                });
                setParentOuOptions(response.data.data ?? []);
            }
        };

        fetchParentOuOptions();
    }, [orgUnit]);

    const formik = useFormik<OrganizationUnitDTO>({
        initialValues: orgUnit ?? {
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
            return errors;
        },
        onSubmit: async (values) => {
            try {
                await organizationUnitsApi.updateOrganizationUnit({
                    ouId: orgId,
                    organizationUnitDTO: {
                        ...values,
                        parentId: selectedParentOuId ?? undefined,
                    },
                });
                router.push(`/org/view/${orgId}`);
            } catch (error) {
                console.error('Ошибка при редактировании OU:', error);
            }
        },
    });

    const handleParentOuChange = (value: string) => {
        setSelectedParentOuId(value);
        formik.setFieldValue('parentOuId', value);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
                <Button view="normal" size="m" onClick={handleOpenModal}>
                    Поиск OU
                </Button>
                {isModalOpen && (
                    <Modal onClose={handleCloseModal}>
                        <h1>Поиск OU</h1>
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
                            <Button view="normal" onClick={handleCloseModal}>
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
            <h1>Редактирование Organization Unit</h1>
            <form onSubmit={formik.handleSubmit}>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Название</label>
                    <TextInput
                        name="name"
                        value={formik.values.name}
                        onUpdate={(value) => formik.setFieldValue('name', value)}
                        onBlur={formik.handleBlur('name')}
                        error={formik.touched.name ? formik.errors.name : undefined}
                        placeholder="Введите название"
                    />
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Владелец</label>
                    <TextInput
                        name="ownerId"
                        value={formik.values.ownerId}
                        onUpdate={(value) => formik.setFieldValue('ownerId', value)}
                        onBlur={formik.handleBlur('ownerId')}
                        error={formik.touched.ownerId ? formik.errors.ownerId : undefined}
                        placeholder="Введите владельца"
                    />
                </div>
                <div style={{marginBottom: '20px'}}>
                    <label style={{display: 'block', marginBottom: '8px'}}>Описание</label>
                    <TextInput
                        name="description"
                        value={formik.values.description}
                        onUpdate={(value) => formik.setFieldValue('description', value)}
                        onBlur={formik.handleBlur('description')}
                        error={formik.touched.description ? formik.errors.description : undefined}
                        placeholder="Введите описание"
                    />
                </div>
                {renderParentOuSelector()}
                <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                    {formik.isSubmitting ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </form>
        </div>
    );
}
