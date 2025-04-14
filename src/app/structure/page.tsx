'use client';

import React, {useCallback, useEffect, useState} from 'react';
import {domainComponentsApi, organizationUnitsApi} from '@/app/apis';
import {
    AccountDTO,
    DomainComponentDTO,
    DomainTreeDTO,
    OrganizationTreeDTO,
    OrganizationUnitDTO,
} from '@/generated/api';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {Button, Modal, Text} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import {OrganizationUnitSmallCard} from '@/components/OrganizationUnitSmallCard';
import {DomainComponentBlock} from '@/components/DomainComponentBlock';
import {DomainComponentForm} from '@/components/forms/DomainComponentForm';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {OrgUnitBlock} from '@/components/OrgUnitBlock';

interface StructurePageProps {}

// eslint-disable-next-line no-empty-pattern
export default function StructurePage({}: StructurePageProps) {
    const [domainComponents, setDomainComponents] = useState<DomainComponentDTO[]>([]);
    const [selectedDcId, setSelectedDcId] = useState<string | null>(null);
    const [domainTree, setDomainTree] = useState<DomainTreeDTO | null>(null);
    const [selectedOu, setSelectedOu] = useState<OrganizationUnitDTO | null>(null);
    const [selectedOuAccounts, setSelectedOuAccounts] = useState<AccountDTO[]>([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingDomainComponent, setEditingDomainComponent] = useState<
        DomainComponentDTO | undefined
    >(undefined);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {checkPermission} = useAuth();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams],
    );

    const handleDcSelect = (id: string) => {
        setSelectedDcId(id);
        setSelectedOu(null);
        router.push(pathname + '?' + createQueryString('dcId', id));
    };

    const fetchDomainComponents = async () => {
        try {
            const response = await domainComponentsApi.getAllDomainComponents();
            setDomainComponents(response.data ?? []);
            if (response.data && response.data.length > 0 && response.data[0].id) {
                handleDcSelect(response.data[0].id);
            }
        } catch (error) {
            console.error('Error fetching domain components:', error);
        }
    };

    useEffect(() => {
        fetchDomainComponents();
    }, []);

    useEffect(() => {
        const dcIdFromPath = searchParams.get('dcId');
        if (dcIdFromPath && domainComponents.some((dc) => dc.id === dcIdFromPath)) {
            setSelectedDcId(dcIdFromPath);
        }
    }, [pathname, domainComponents]);

    const fetchAccounts = async (ouId: string) => {
        try {
            const response = await organizationUnitsApi.getAccountsByouId({ouId});
            setSelectedOuAccounts(response.data ?? []);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        }
    };

    useEffect(() => {
        if (selectedDcId) {
            const fetchDomainTree = async () => {
                try {
                    const response = await domainComponentsApi.getDomainComponentTree({
                        dcId: selectedDcId,
                    });
                    setDomainTree(response.data ?? null);
                    const firstOu =
                        response.data?.children.length > 0
                            ? response.data?.children[0].unit
                            : undefined;
                    if (firstOu && firstOu.id) {
                        setSelectedOu(firstOu);
                        fetchAccounts(firstOu.id);
                    }
                } catch (error) {
                    console.error('Error fetching domain tree:', error);
                }
            };

            fetchDomainTree();
        }
    }, [selectedDcId]);

    useEffect(() => {
        if (selectedOu && selectedOu.id) {
            fetchAccounts(selectedOu.id);
        }
    }, [selectedOu?.id]);

    const handleCreateDC = () => {
        console.log('domainComponent handleCreateDC');
        setIsCreateModalOpen(true);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setEditingDomainComponent(undefined);
    };

    const handleCreateOU = () => {
        router.push('/org/create');
    };

    const handleDcEdit = (id: string) => {
        const dc = domainComponents.find((dc2) => dc2.id === id);
        console.log('domainComponent handleDcEdit id', id, 'dc', dc);
        if (dc) {
            setEditingDomainComponent(dc);
            setIsCreateModalOpen(true);
        }
    };

    const handleDcDelete = async (id: string) => {
        const dc = domainComponents.find((dc2) => dc2.id === id);
        console.log('domainComponent handleDcDelete id', id, 'dc', dc);
        if (dc && dc.id) {
            await domainComponentsApi.deleteDomainComponent({dcId: dc.id});
            await fetchDomainComponents();
            if (selectedDcId === dc.id) {
                setSelectedDcId(null);
            }
        }
    };

    const handleDcSubmitCreate = async (values: DomainComponentDTO) => {
        try {
            if (editingDomainComponent) {
                // Редактирование существующего Domain Component
                await domainComponentsApi.updateDomainComponent({
                    dcId: editingDomainComponent.id ?? '???',
                    domainComponentDTO: values,
                });
            } else {
                // Создание нового Domain Component
                await domainComponentsApi.createDomainComponent({domainComponentDTO: values});
            }
            handleCloseCreateModal();
            await fetchDomainComponents();
        } catch (error) {
            console.error('Ошибка при создании/редактировании Domain Component:', error);
        }
    };

    const handleOuSelect = (ou: OrganizationUnitDTO) => {
        setSelectedOu(ou);
        router.push(pathname + '?' + createQueryString('ouId', ou.id ?? '???'));
    };

    const handleSelectedOuEdit = (ou: OrganizationUnitDTO) => {
        router.push(`/org/edit/${ou.id}`);
    };

    const handleSelectedOuDelete = async (id: string) => {
        console.log('handleOuDelete id', id);
        if (id) {
            await organizationUnitsApi.deleteOrganizationUnit({ouId: id});
            await fetchDomainComponents();
            if (selectedOu?.id === id) {
                setSelectedDcId(null);
            }
        }
    };

    const renderDomainTree = (tree: DomainTreeDTO | null) => {
        if (!tree) return null;

        const renderItem = (item: OrganizationTreeDTO, level = 0) => {
            return (
                <div key={item.unit.id} style={{marginLeft: `${level * 30}px`}}>
                    <OrganizationUnitSmallCard orgUnit={item.unit} onSelect={handleOuSelect} />
                    {item.items && item.items.length > 0 && (
                        <div>{item.items.map((child) => renderItem(child, level + 1))}</div>
                    )}
                </div>
            );
        };

        return (
            <div>
                {tree.children && tree.children.length > 0 && (
                    <div>{tree.children.map((child) => renderItem(child))}</div>
                )}
            </div>
        );
    };

    return (
        <div style={{padding: '20px'}}>
            <Box marginBottom="20px">
                <Text variant="header-1">Domain Components</Text>
                <HorizontalStack align="center">
                    {domainComponents.map((dc) => (
                        <Box marginRight="20px" key={dc.id}>
                            <DomainComponentBlock
                                data={dc}
                                onEdit={handleDcEdit}
                                onDelete={handleDcDelete}
                                onClick={() => handleDcSelect(dc.id ?? '???')}
                                isActive={dc.id === selectedDcId}
                            />
                        </Box>
                    ))}
                    {checkPermission('web-global-domain-component', 'create') && (
                        <Box marginBottom="10px">
                            <Button view="action" size="l" onClick={handleCreateDC}>
                                Создать Domain Component
                            </Button>
                        </Box>
                    )}
                </HorizontalStack>
            </Box>
            <div style={{flex: 1}}>
                <h1>Organization Units</h1>
                <HorizontalStack>
                    {renderDomainTree(domainTree)}
                    <div style={{width: '400px', marginLeft: '20px'}}>
                        {selectedOu && (
                            <OrgUnitBlock
                                data={selectedOu}
                                dataAccounts={selectedOuAccounts}
                                onEdit={handleSelectedOuEdit}
                                onDelete={handleSelectedOuDelete}
                            />
                        )}
                    </div>
                </HorizontalStack>
            </div>
            <div>
                {checkPermission('web-global-organization-unit', 'create') && (
                    <Button view="action" size="l" onClick={handleCreateOU}>
                        Создать Organization Unit
                    </Button>
                )}
            </div>
            <Modal open={isCreateModalOpen} onOpenChange={handleCloseCreateModal}>
                <DomainComponentForm
                    initialValue={editingDomainComponent}
                    onSubmit={handleDcSubmitCreate}
                    onClose={handleCloseCreateModal}
                />
            </Modal>
        </div>
    );
}
