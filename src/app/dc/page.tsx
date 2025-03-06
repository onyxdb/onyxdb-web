'use client';

import React, {useEffect, useState} from 'react';
import {domainComponentsApi} from '@/app/apis';
import {DomainComponentDTO, OrganizationUnitDTO} from '@/generated/api';
import {Button, Modal} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';
import {DomainComponentBlock} from '@/components/DomainComponentBlock';
import {DomainComponentForm} from '@/components/forms/DomainComponentForm';

export default function DcPage() {
    const [domainComponents, setDomainComponents] = useState<DomainComponentDTO[]>([]);

    const [domainComponentsWithRootOrgs, setDomainComponentsWithRootOrgs] = useState<
        (DomainComponentDTO & {
            roots?: OrganizationUnitDTO[];
        })[]
    >([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDomainComponent, setEditingDomainComponent] = useState<DomainComponentDTO | null>(
        null,
    );
    const {permissions} = usePermissions();

    useEffect(() => {
        domainComponentsApi
            .getAllDomainComponents()
            .then((response) => setDomainComponents(response.data ?? []))
            .catch((error) => console.error('Error fetching domain components:', error));
    }, []);

    useEffect(() => {
        const fetchRoots = async () => {
            const updatedDCs = await Promise.all(
                domainComponents.map(async (dc) => {
                    const rootsResponse =
                        await domainComponentsApi.getDomainComponentRootsOrganizationUnits({
                            dcId: dc.id ?? '',
                        });
                    return {
                        ...dc,
                        roots: rootsResponse.data ?? [],
                    };
                }),
            );
            setDomainComponentsWithRootOrgs(updatedDCs);
        };

        fetchRoots();
    }, [domainComponents]);

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingDomainComponent(null);
    };

    const handleEdit = (id: string) => {
        const dc = domainComponents.find((dc) => dc.id === id);
        if (dc) {
            setEditingDomainComponent(dc);
            setIsCreateModalOpen(true);
        }
    };

    const handleSubmitCreate = async (values: DomainComponentDTO) => {
        try {
            if (editingDomainComponent) {
                // Редактирование существующего Domain Component
                await domainComponentsApi.updateDomainComponent({
                    dcId: editingDomainComponent.id ?? '',
                    domainComponentDTO: values,
                });
            } else {
                // Создание нового Domain Component
                await domainComponentsApi.createDomainComponent({domainComponentDTO: values});
            }
            handleCloseCreateModal();
            // Обновление списка domain components
            const response = await domainComponentsApi.getAllDomainComponents();
            setDomainComponents(response.data ?? []);
        } catch (error) {
            console.error('Ошибка при создании/редактировании Domain Component:', error);
        }
    };

    return (
        <div style={{padding: '20px'}}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h1>Domain Components</h1>
                {permissions['web-global-create'] && (
                    <Button view="action" size="l" onClick={handleCreate}>
                        Создать Domain Component
                    </Button>
                )}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                {domainComponentsWithRootOrgs.map((dc) => (
                    <DomainComponentBlock
                        key={dc.id}
                        id={dc.id ?? '???'}
                        name={dc.name ?? '???'}
                        roots={dc.roots ?? []}
                        onEdit={handleEdit}
                    />
                ))}
            </div>
            {isCreateModalOpen && (
                <Modal onClose={handleCloseCreateModal}>
                    <h1>
                        {editingDomainComponent
                            ? 'Редактирование Domain Component'
                            : 'Создание нового Domain Component'}
                    </h1>
                    <div>
                        {editingDomainComponent ? (
                            <DomainComponentForm
                                initialValue={editingDomainComponent}
                                onSubmit={handleSubmitCreate}
                            />
                        ) : (
                            'Ошибка отображения формы'
                        )}
                    </div>
                    <div>
                        <Button view="normal" onClick={handleCloseCreateModal}>
                            Закрыть
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
