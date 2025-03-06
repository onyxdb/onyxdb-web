'use client';

import React, {useEffect, useState} from 'react';
import {domainComponentsApi} from '@/app/apis';
import {DomainComponentDTO} from '@/generated/api';
import {DomainComponentBlock} from '@/components/DomainComponentBlock';

export default function StructurePage() {
    const [domainComponents, setDomainComponents] = useState<DomainComponentDTO[]>([]);
    // const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    // const [editingDomainComponent, setEditingDomainComponent] = useState<DomainComponentDTO | null>(
    //     null,
    // );
    // const {permissions} = usePermissions();

    useEffect(() => {
        domainComponentsApi
            .getAllDomainComponents()
            .then((response) => setDomainComponents(response.data ?? []))
            .catch((error) => console.error('Error fetching domain components:', error));
    }, []);

    // const handleCreate = () => {
    //     setIsCreateModalOpen(true);
    // };
    //
    // const handleCloseCreateModal = () => {
    //     setIsCreateModalOpen(false);
    //     setEditingDomainComponent(null);
    //     formik.resetForm();
    // };
    //
    // const handleEdit = (id: string) => {
    //     const dc = domainComponents.find((dc) => dc.id === id);
    //     if (dc) {
    //         setEditingDomainComponent(dc);
    //         setIsCreateModalOpen(true);
    //     }
    // };

    // const handleSubmitCreate = async (values: DomainComponentDTO) => {
    //     try {
    //         if (editingDomainComponent) {
    //             // Редактирование существующего Domain Component
    //             await domainComponentsApi.updateDomainComponent({
    //                 dcId: editingDomainComponent.id ?? '',
    //                 domainComponentDTO: values,
    //             });
    //         } else {
    //             // Создание нового Domain Component
    //             await domainComponentsApi.createDomainComponent({domainComponentDTO: values});
    //         }
    //         handleCloseCreateModal();
    //         // Обновление списка domain components
    //         const response = await domainComponentsApi.getAllDomainComponents();
    //         setDomainComponents(response.data ?? []);
    //     } catch (error) {
    //         console.error('Ошибка при создании/редактировании Domain Component:', error);
    //     }
    // };
    //
    // const formik = useFormik<DomainComponentDTO>({
    //     initialValues: editingDomainComponent ?? {
    //         id: '',
    //         name: '',
    //         description: '',
    //     },
    //     onSubmit: handleSubmitCreate,
    //     enableReinitialize: true,
    // });

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
                <h1>Основная оргструктура</h1>
                {/*{permissions['web-global-create'] && (*/}
                {/*    <Button view="action" size="l" onClick={handleCreate}>*/}
                {/*        Создать Domain Component*/}
                {/*    </Button>*/}
                {/*)}*/}
            </div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '20px'}}>
                {domainComponents.map((dc) => (
                    <DomainComponentBlock
                        key={dc.id}
                        id={dc.id ?? ''}
                        name={dc.name ?? ''}
                        onEdit={() => {}}
                    />
                ))}
            </div>
            {/*<ModalManager*/}
            {/*    manager={modalManager}*/}
            {/*    modals={[*/}
            {/*        {*/}
            {/*            id: 'create-edit-domain-component-modal',*/}
            {/*            content: (*/}
            {/*                <Modal onClose={handleCloseCreateModal}>*/}
            {/*                    <Modal.Header>*/}
            {/*                        {editingDomainComponent*/}
            {/*                            ? 'Редактирование Domain Component'*/}
            {/*                            : 'Создание нового Domain Component'}*/}
            {/*                    </Modal.Header>*/}
            {/*                    <Modal.Body>*/}
            {/*                        <DomainComponentForm*/}
            {/*                            initialValue={editingDomainComponent}*/}
            {/*                            onSubmit={handleSubmitCreate}*/}
            {/*                        />*/}
            {/*                    </Modal.Body>*/}
            {/*                </Modal>*/}
            {/*            ),*/}
            {/*            isOpen: isCreateModalOpen,*/}
            {/*        },*/}
            {/*    ]}*/}
            {/*/>*/}
        </div>
    );
}
