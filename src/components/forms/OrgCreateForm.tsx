'use client';

import React, {useEffect, useState} from 'react';
import {useFormik} from 'formik';
import {Button, Card, Modal, Text, TextInput} from '@gravity-ui/uikit';
import {AccountDTO, DomainComponentDTO, OrganizationUnitDTO} from '@/generated/api';
import {accountsApi, domainComponentsApi, organizationUnitsApi} from '@/app/apis';
import {InputField} from '@/components/formik/InputField';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {Box} from '@/components/Layout/Box';
import {TextAreaField} from '@/components/formik/TextAreaField';

interface OrgCreateFormProps {
    onSubmit: (values: OrgUnitFormFields) => void;
    closeAction: () => void;
}

export interface OrgUnitFormFields {
    name: string;
    description: string;
    domainComponent: string;
    domainComponentId: string;
    parentOrgUnit: string;
    parentOrgUnitId: string;
    ownerAccount: string;
    ownerAccountId: string;
}

export const OrgCreateForm: React.FC<OrgCreateFormProps> = ({onSubmit, closeAction}) => {
    const [domainComponents, setDomainComponents] = useState<DomainComponentDTO[]>([]);
    const [parentOuOptions, setParentOuOptions] = useState<OrganizationUnitDTO[]>([]);
    const [accountOptions, setAccountOptions] = useState<AccountDTO[]>([]);
    const [selectedDcId, setSelectedDcId] = useState<string | null>(null);
    const [searchDc, setSearchDc] = useState<string | null>(null);
    const [selectedParentOuId, setSelectedParentOuId] = useState<string | null>(null);
    const [searchOu, setSearchOu] = useState<string | null>(null);
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [searchAccount, setSearchAccount] = useState<string | null>(null);
    const [isParentModalOpen, setIsParentModalOpen] = useState(false);
    const [isDcModalOpen, setIsDcModalOpen] = useState(false);
    const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

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
                    limit: 10,
                });
                setParentOuOptions(response.data.data ?? []);
            }
        };

        fetchParentOuOptions();
    }, [selectedDcId]);

    const fetchAccountOptions = async () => {
        console.log('fetchAccountOptions searchAccount', searchAccount, Boolean(searchAccount));
        if (searchAccount) {
            const response = await accountsApi.getAllAccounts({
                search: searchAccount,
                limit: 10,
            });
            setAccountOptions(response.data.data ?? []);
        }
    };

    const formik = useFormik<OrgUnitFormFields>({
        initialValues: {
            name: '',
            description: '',
            domainComponent: '',
            domainComponentId: '',
            parentOrgUnit: '',
            parentOrgUnitId: '',
            ownerAccount: '',
            ownerAccountId: '',
        },
        validate: (values) => {
            const errors: Partial<OrgUnitFormFields> = {};
            if (!values.name) {
                errors.name = 'Название обязательно';
            }
            if (!values.description) {
                errors.description = 'Описание обязательно';
            }
            if (!values.ownerAccount || !values.ownerAccountId) {
                errors.ownerAccount = 'Владелец обязателен';
            }
            if (!values.domainComponent || !values.domainComponentId) {
                errors.domainComponent = 'Domain Component обязателен';
            }
            return errors;
        },
        onSubmit,
    });

    const handleDcChange = (value: string) => {
        setSearchDc(value);
        formik.setFieldValue('domainComponent', value);
    };

    const handleDcSelect = (dc: DomainComponentDTO) => {
        console.log('handleDcSelect dc', dc);
        setIsDcModalOpen(false);
        setSelectedDcId(dc.id);
        setSearchDc(dc.name);
        formik.setFieldValue('domainComponent', dc.name);
        formik.setFieldValue('domainComponentId', dc.id);
    };

    const handleParentOuChange = (value: string) => {
        setSearchOu(value);
        formik.setFieldValue('parentOrgUnit', value);
    };

    const handleParentOuSelect = (ou: OrganizationUnitDTO) => {
        console.log('handleParentOuSelect ou', ou);
        setIsParentModalOpen(false);
        setSelectedParentOuId(ou.id);
        setSearchOu(ou.name);
        formik.setFieldValue('parentOrgUnit', ou.name);
        formik.setFieldValue('parentOrgUnitId', ou.id);
    };

    const handleAccountChange = (value: string) => {
        console.log('handleAccountChange value', value);
        setSearchAccount(value);
        formik.setFieldValue('ownerAccount', value);
    };

    const handleAccountSelect = (data: AccountDTO) => {
        console.log('handleAccountSelect data', data);
        setIsAccountsModalOpen(false);
        setSelectedAccountId(data.id);
        setSearchAccount(`${data.firstName} ${data.lastName} (${data.email})`);
        formik.setFieldValue('ownerAccount', `${data.firstName} ${data.lastName} (${data.email})`);
        formik.setFieldValue('ownerAccountId', data.id);
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

    const handleOpenAccountsModal = () => {
        fetchAccountOptions();
        setIsAccountsModalOpen(true);
    };

    const handleCloseAccountsModal = () => {
        setIsAccountsModalOpen(false);
    };

    const renderDcSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>Domain Component</label>
                <TextInput
                    name="domainComponent"
                    value={searchDc ?? selectedDcId ?? ''}
                    onUpdate={handleDcChange}
                    onBlur={formik.handleBlur('domainComponent')}
                    error={
                        formik.touched.domainComponent ? formik.errors.domainComponent : undefined
                    }
                    placeholder="Введите и выберите Domain Component"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenDcModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск Domain Component
                </Button>
                <Modal open={isDcModalOpen} onOpenChange={handleCloseDcModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск Domain Component</Text>
                        <Box marginTop="10px">
                            {domainComponents
                                .filter((item) =>
                                    `${item.name}|${item.description}`
                                        .toLowerCase()
                                        .includes(searchDc?.toLowerCase() ?? ''),
                                )
                                .map((dc) => (
                                    <Card
                                        key={dc.id}
                                        type="selection"
                                        onClick={() => handleDcSelect(dc)}
                                        style={{marginBottom: '10px', padding: '16px'}}
                                    >
                                        <Text variant="header-1">{dc.name}</Text>
                                        <Box>
                                            <Text
                                                variant="subheader-1"
                                                color="secondary"
                                                ellipsis={true}
                                            >
                                                {dc.description}
                                            </Text>
                                        </Box>
                                    </Card>
                                ))}
                        </Box>
                        <div>
                            <Button view="normal" onClick={handleCloseDcModal}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };

    const renderParentOuSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Родительский Organization Unit
                </label>
                <TextInput
                    name="parentOuId"
                    value={searchOu ?? selectedParentOuId ?? ''}
                    onUpdate={handleParentOuChange}
                    onBlur={formik.handleBlur('parentOu')}
                    error={formik.touched.parentOrgUnit ? formik.errors.parentOrgUnit : undefined}
                    placeholder="Введите или выберите родительский OU"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenParentModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск OU
                </Button>
                <Modal open={isParentModalOpen} onOpenChange={handleCloseParentModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск Organization Unit</Text>
                        <Box marginTop="10px">
                            {parentOuOptions
                                .filter((item) =>
                                    `${item.name}|${item.description}`
                                        .toLowerCase()
                                        .includes(searchOu?.toLowerCase() ?? ''),
                                )
                                .map((ou) => (
                                    <Card
                                        key={ou.id}
                                        type="selection"
                                        onClick={() => handleParentOuSelect(ou)}
                                        style={{marginBottom: '10px', padding: '16px'}}
                                    >
                                        <Text variant="header-1">{ou.name}</Text>
                                        <Box>
                                            <Text
                                                variant="subheader-1"
                                                color="secondary"
                                                ellipsis={true}
                                            >
                                                {ou.description}
                                            </Text>
                                        </Box>
                                    </Card>
                                ))}
                        </Box>
                        <div>
                            <Button view="normal" onClick={handleCloseParentModal}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };

    const renderAccountsSelector = () => {
        return (
            <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px'}}>
                    Владелец нового Organization Unit
                </label>
                <TextInput
                    name="ownerAccountId"
                    value={searchAccount ?? selectedAccountId ?? ''}
                    onUpdate={handleAccountChange}
                    onBlur={formik.handleBlur('ownerAccount')}
                    error={formik.touched.ownerAccount ? formik.errors.ownerAccount : undefined}
                    placeholder="Введите и выберите владельца"
                />
                <Button
                    view="normal"
                    size="m"
                    onClick={handleOpenAccountsModal}
                    style={{marginTop: '10px'}}
                >
                    Поиск аккаунта
                </Button>
                <Modal open={isAccountsModalOpen} onOpenChange={handleCloseAccountsModal}>
                    <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
                        <Text variant="header-1">Поиск аккаунта владельца</Text>
                        <Box marginTop="10px">
                            {accountOptions.map((item) => (
                                <Card
                                    key={item.id}
                                    type="selection"
                                    onClick={() => handleAccountSelect(item)}
                                    style={{marginBottom: '10px', padding: '16px'}}
                                >
                                    <Text variant="header-1">{`${item.firstName} ${item.lastName}`}</Text>
                                    <Box>
                                        <Text
                                            variant="subheader-1"
                                            color="secondary"
                                            ellipsis={true}
                                        >
                                            {item.email}
                                        </Text>
                                    </Box>
                                </Card>
                            ))}
                        </Box>
                        <div>
                            <Button view="normal" onClick={handleCloseAccountsModal}>
                                Закрыть
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <h1>Создание нового Organization Unit</h1>
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
                <TextAreaField
                    label="Описание"
                    name="description"
                    value={formik.values.description}
                    onChange={(value) => formik.setFieldValue('description', value)}
                    onBlur={formik.handleBlur('description')}
                    error={formik.touched.description ? formik.errors.description : undefined}
                    placeholder="Введите описание"
                />
                {renderAccountsSelector()}
                {renderDcSelector()}
                {selectedDcId && renderParentOuSelector()}
                <HorizontalStack>
                    <Button type="submit" view="action" size="l" disabled={formik.isSubmitting}>
                        {formik.isSubmitting ? 'Создание...' : 'Создать OU'}
                    </Button>
                    <Box marginLeft="20px">
                        <Button
                            view="normal"
                            size="l"
                            disabled={formik.isSubmitting}
                            onClick={closeAction}
                        >
                            {'Отменить'}
                        </Button>
                    </Box>
                </HorizontalStack>
            </form>
        </div>
    );
};
