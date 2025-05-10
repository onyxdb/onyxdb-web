'use client';
import React, {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO, BusinessRoleDTO, OrganizationUnitDTO, RoleDTO} from '@/generated/api';
import {usePathname, useRouter} from 'next/navigation';
import {Card, Icon, Modal, Tab, TabList, TabPanel, TabProvider, Text} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import {Box} from '@/components/Layout/Box';
import {
    ArrowUpRightFromSquare,
    Briefcase,
    Calendar,
    CircleInfoFill,
    Clock,
    FileText,
    Folder,
    Handset,
    MapPin,
    Pencil,
    Person,
    Persons,
    TrashBin,
} from '@gravity-ui/icons';
import {AccountData, AccountForm, AccountFormDTO} from '@/components/forms/AccountForm';
import {UserBlock} from '@/components/common/UserBlock';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {MyLoader} from '@/components/Loader';
import {AppHeader} from '@/components/AppHeader/AppHeader';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

interface AccountViewPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function AccountViewPage({}: AccountViewPageProps) {
    const [teamLead, setTeamLead] = useState<AccountDTO | null>(null);
    const [account, setAccount] = useState<AccountDTO | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accountOrgUnits, setAccountOrgUnits] = useState<OrganizationUnitDTO[]>([]);
    const [accountRoles, setAccountRoles] = useState<RoleDTO[]>([]);
    const [accountBusinessRoles, setAccountBusinessRoles] = useState<BusinessRoleDTO[]>([]);
    const [activeTab, setActiveTab] = useState<string>('additional-info');
    const router = useRouter();
    const pathname = usePathname();
    const {checkPermission, user} = useAuth();
    const accountId = pathname.split('/').pop() ?? '';

    // @ts-ignore
    const data = account ? (account.data as AccountData) : null;

    const fetchAccount = async () => {
        try {
            const response = await accountsApi.getAccountById({accountId});
            setAccount(response.data ?? null);
        } catch (error) {
            toaster.add({
                name: 'error_account_fetch',
                title: 'Ошибка при загрузке аккаунта',
                content: `Не удалось загрузить аккаунт ${error}`,
                theme: 'danger',
            });
        }
    };

    useEffect(() => {
        fetchAccount();
    }, [accountId]);

    const fetchAccountOrgUnits = async () => {
        try {
            const response = await accountsApi.getAccountOrganizationUnits({accountId});
            setAccountOrgUnits(response.data ?? []);
            const ownerAccountId = response.data && response.data[0].ownerId;
            if (ownerAccountId) {
                const responseOwner = await accountsApi.getAccountById({accountId: ownerAccountId});
                setTeamLead(responseOwner.data);
            }
        } catch (error) {
            toaster.add({
                name: 'error_account_org_units_fetch',
                title: 'Ошибка при загрузке Organization Units',
                content: `Не удалось загрузить Organization Units ${error}`,
                theme: 'danger',
            });
        }
    };

    useEffect(() => {
        fetchAccountOrgUnits();
    }, [accountId]);

    const fetchAccountRoles = async () => {
        try {
            const response = await accountsApi.getAccountRoles({accountId});
            setAccountRoles(response.data ?? []);
        } catch (error) {
            toaster.add({
                name: 'error_account_roles_fetch',
                title: 'Ошибка при загрузке ролей',
                content: `Не удалось загрузить роли ${error}`,
                theme: 'danger',
            });
        }
    };

    useEffect(() => {
        fetchAccountRoles();
    }, [accountId]);

    const fetchAccountBusinessRoles = async () => {
        try {
            const response = await accountsApi.getAccountBusinessRoles({accountId});
            setAccountBusinessRoles(response.data ?? []);
        } catch (error) {
            toaster.add({
                name: 'error_account_business_roles_fetch',
                title: 'Ошибка при загрузке бизнес-ролей',
                content: `Не удалось загрузить бизнес-роли ${error}`,
                theme: 'danger',
            });
        }
    };

    useEffect(() => {
        fetchAccountBusinessRoles();
    }, [accountId]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSubmitEdit = async (values: AccountFormDTO) => {
        try {
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            values.data = values.anyData;
            const {anyData: _, ...newValues} = values;
            await accountsApi.updateAccount({
                accountId: values.id ?? ('???' as string),
                accountPostDTO: newValues,
            });
            toaster.add({
                name: `account_edit_${values.id}`,
                title: `Аккаунт ${values.firstName} ${values.lastName} успешно изменён`,
                content: 'Операция выполнена успешно.',
                theme: 'success',
            });
            handleCloseEditModal();
            const response = await accountsApi.getAccountById({
                accountId: values.id ?? ('???' as string),
            });
            setAccount(response.data ?? null);
        } catch (error) {
            toaster.add({
                name: `account_edit_${accountId}`,
                title: 'Ошибка изменения аккаунта',
                content: `Не удалось изменить аккаунт ${error}`,
                theme: 'danger',
            });
        }
    };

    const handleDelete = () => {
        accountsApi
            .deleteAccount({accountId})
            .then(() => {
                toaster.add({
                    name: `account_delete_${accountId}`,
                    title: `Аккаунт ${account?.firstName} ${account?.lastName} успешно удалён`,
                    content: 'Операция успешно выполнена',
                    theme: 'success',
                });
                router.push('/accounts');
            })
            .catch((error) => {
                toaster.add({
                    name: `error_account_delete_${accountId}`,
                    title: `Ошибка удаления аккаунта ${account?.firstName} ${account?.lastName}`,
                    content: `Не удалось удалить аккаунт ${error}`,
                    theme: 'danger',
                });
            });
    };

    if (!account) {
        return <MyLoader />;
    }

    const breadCrumbs = [
        {href: '/', text: 'Главная'},
        {href: '/accounts', text: 'Аккаунты'},
        {href: `/accounts/view/${accountId}`, text: account.username},
    ];

    const actions = [];
    console.log('user.account.id', user?.account.id, account.id);
    if (user?.account.id === account.id || checkPermission(`account`, 'edit', accountId)) {
        actions.push({
            text: 'Редактировать',
            action: handleEdit,
            icon: Pencil,
        });
    }
    if (checkPermission('account', 'delete')) {
        actions.push({
            text: 'Удалить',
            action: handleDelete,
            icon: TrashBin,
        });
    }

    const renderInfoTab = () => {
        return (
            <div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Handset} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Номер телефона:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data?.phoneNumber ?? '???'}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Дата рождения:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data?.dateOfBirth ?? '???'}
                        </Text>
                    </HorizontalStack>
                </div>
            </div>
        );
    };

    const renderAdditionalInfoTab = () => {
        return (
            <div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Briefcase} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Штатная должность:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data?.jobTitle}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={Clock} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Режим работы:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data?.workSchedule}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={MapPin} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Город проживания:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data?.city}
                        </Text>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={ArrowUpRightFromSquare} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Ссылки на соцсети:
                        </Text>
                        <div style={{marginLeft: '16px'}}>
                            {data?.socialLinks?.vk && (
                                <div style={{marginBottom: '5px'}}>
                                    <Text variant="caption-2" color="secondary">
                                        VK:
                                    </Text>
                                    <Text variant="body-1" color="link">
                                        {data.socialLinks?.vk}
                                    </Text>
                                </div>
                            )}
                            {data?.socialLinks?.facebook && (
                                <div>
                                    <Text variant="caption-2" color="secondary">
                                        Facebook:
                                    </Text>
                                    <Text variant="body-1" color="link">
                                        {data.socialLinks?.facebook}
                                    </Text>
                                </div>
                            )}
                            {data?.socialLinks?.linkedin && (
                                <div>
                                    <Text variant="caption-2" color="secondary">
                                        LinkedIn:
                                    </Text>
                                    <Text variant="body-1" color="link">
                                        {data.socialLinks?.linkedin}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={CircleInfoFill} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            О себе:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data?.description}
                        </Text>
                    </HorizontalStack>
                </div>
            </div>
        );
    };

    const renderOrgUnitsTab = () => {
        return (
            <div>
                {accountOrgUnits.map((ou) => (
                    <div key={ou.id} style={{marginBottom: '10px'}}>
                        <Card style={{padding: '16px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={Folder} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Название:
                                    </Text>
                                    <Text variant="body-1" color="primary">
                                        {ou.name}
                                    </Text>
                                </HorizontalStack>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={FileText} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Описание:
                                    </Text>
                                    <Text variant="body-1" color="primary">
                                        {ou.description}
                                    </Text>
                                </HorizontalStack>
                                {teamLead?.id && teamLead?.id !== account.id && (
                                    <HorizontalStack align="center">
                                        <Box marginRight="8px">
                                            <Icon data={Person} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            Наставник:
                                        </Text>
                                        <UserBlock account={teamLead} selectable={true} size="m" />
                                    </HorizontalStack>
                                )}
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={Clock} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Дата создания:
                                    </Text>
                                    {ou.createdAt && (
                                        <Text variant="body-1" color="primary">
                                            {new Date(ou.createdAt).toLocaleDateString()}
                                        </Text>
                                    )}
                                </HorizontalStack>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={Clock} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Дата обновления:
                                    </Text>
                                    {ou.updatedAt && (
                                        <Text variant="body-1" color="primary">
                                            {new Date(ou.updatedAt).toLocaleDateString()}
                                        </Text>
                                    )}
                                </HorizontalStack>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        );
    };

    const renderRolesTab = () => {
        return (
            <div>
                {accountRoles.map((role) => (
                    <div key={role.id} style={{marginBottom: '10px'}}>
                        <Card style={{padding: '16px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={Person} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Название роли:
                                    </Text>
                                    <Text variant="body-1" color="primary">
                                        {role.name}
                                    </Text>
                                </HorizontalStack>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={FileText} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Описание:
                                    </Text>
                                    <Text variant="body-1" color="primary">
                                        {role.description}
                                    </Text>
                                </HorizontalStack>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        );
    };

    const renderBusinessRolesTab = () => {
        return (
            <div>
                {accountBusinessRoles.map((br) => (
                    <div key={br.id} style={{marginBottom: '10px'}}>
                        <Card style={{padding: '16px'}}>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={Persons} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Название бизнес-роли:
                                    </Text>
                                    <Text variant="body-1" color="primary">
                                        {br.name}
                                    </Text>
                                </HorizontalStack>
                                <HorizontalStack align="center">
                                    <Box marginRight="8px">
                                        <Icon data={FileText} />
                                    </Box>
                                    <Text variant="caption-2" color="secondary">
                                        Описание:
                                    </Text>
                                    <Text variant="body-1" color="primary">
                                        {br.description}
                                    </Text>
                                </HorizontalStack>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <AppHeader breadCrumbs={breadCrumbs} actions={actions} />
            <div style={{padding: '20px'}}>
                <HorizontalStack align="center" justify="space-between">
                    <div>
                        {account && <UserBlock account={account} selectable={true} size="l" />}
                    </div>
                </HorizontalStack>
                <Box marginTop="20px">{renderInfoTab()}</Box>
                <Box marginTop="10px" marginBottom="10px">
                    <TabProvider value={activeTab} onUpdate={setActiveTab}>
                        <TabList>
                            <Tab value="additional-info">Дополнительная информация</Tab>
                            <Tab value="org-units">Organization Units</Tab>
                            <Tab value="roles">Роли</Tab>
                            <Tab value="business-roles">Бизнес Роли</Tab>
                        </TabList>
                        <Box marginTop="10px">
                            <TabPanel value="additional-info">{renderAdditionalInfoTab()}</TabPanel>
                            <TabPanel value="org-units">{renderOrgUnitsTab()}</TabPanel>
                            <TabPanel value="roles">{renderRolesTab()}</TabPanel>
                            <TabPanel value="business-roles">{renderBusinessRolesTab()}</TabPanel>
                        </Box>
                    </TabProvider>
                </Box>
            </div>
            <Modal open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                <AccountForm
                    initialValue={account}
                    onSubmit={handleSubmitEdit}
                    closeAction={handleCloseEditModal}
                />
            </Modal>
        </div>
    );
}
