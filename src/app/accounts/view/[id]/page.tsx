'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO, BusinessRoleDTO, OrganizationUnitDTO, RoleDTO} from '@/generated/api';
import {usePathname, useRouter} from 'next/navigation';
import {Button, Card, Icon, Modal, Tab, TabList, TabProvider, Text, User} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';
import {Box} from '@/components/Layout/Box';
import {
    ArrowUpRightFromSquare,
    Briefcase,
    Calendar,
    CircleInfoFill,
    Clock,
    Envelope,
    FileText,
    Folder,
    Handset,
    MapPin,
    Person,
    Persons,
} from '@gravity-ui/icons';
import {AccountForm} from '@/components/forms/AccountForm';

interface AccountViewPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function AccountViewPage({}: AccountViewPageProps) {
    const [teamLead, setTeamLead] = useState<AccountDTO | null>(null);
    const [account, setAccount] = useState<AccountDTO | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [accountOrgUnits, setAccountOrgUnits] = useState<OrganizationUnitDTO[]>([]);
    const [accountRoles, setAccountRoles] = useState<RoleDTO[]>([]);
    const [accountBusinessRoles, setAccountBusinessRoles] = useState<BusinessRoleDTO[]>([]);
    const [activeTab, setActiveTab] = useState<string>('info');
    const router = useRouter();
    const pathname = usePathname();
    const {permissions} = usePermissions();

    const accountId = pathname.split('/').pop() ?? '';

    // @ts-ignore
    const data = account ? (account.data as AccountData) : null;

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const response = await accountsApi.getAccountById({accountId});
                setAccount(response.data ?? null);
            } catch (error) {
                console.error('Error fetching account:', error);
            }
        };

        fetchAccount();
    }, [accountId]);

    useEffect(() => {
        const fetchAccountOrgUnits = async () => {
            try {
                const response = await accountsApi.getAccountOrganizationUnits({
                    accountId,
                });
                setAccountOrgUnits(response.data ?? []);

                const ownerAccountId = response.data && response.data[0].ownerId;
                if (ownerAccountId) {
                    const responseOwner = await accountsApi.getAccountById({
                        accountId: ownerAccountId,
                    });
                    setTeamLead(responseOwner.data);
                }
            } catch (error) {
                console.error('Error fetching account org units:', error);
            }
        };

        fetchAccountOrgUnits();
    }, [accountId]);

    useEffect(() => {
        const fetchAccountRoles = async () => {
            try {
                const response = await accountsApi.getAccountRoles({accountId});
                setAccountRoles(response.data ?? []);
            } catch (error) {
                console.error('Error fetching account roles:', error);
            }
        };

        fetchAccountRoles();
    }, [accountId]);

    useEffect(() => {
        const fetchAccountBusinessRoles = async () => {
            try {
                const response = await accountsApi.getAccountBusinessRoles({accountId});
                setAccountBusinessRoles(response.data ?? []);
            } catch (error) {
                console.error('Error fetching account business roles:', error);
            }
        };

        fetchAccountBusinessRoles();
    }, [accountId]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleSubmitEdit = async (values: AccountDTO) => {
        try {
            await accountsApi.updateAccount({accountId: values.id ?? '???', accountDTO: values});
            handleCloseEditModal();
            // Обновление данных об аккаунте
            const response = await accountsApi.getAccountById({accountId: values.id ?? '???'});
            setAccount(response.data ?? null);
        } catch (error) {
            console.error('Ошибка при редактировании аккаунта:', error);
        }
    };

    const handleDelete = () => {
        accountsApi
            .deleteAccount({accountId})
            .then(() => {
                console.log('Account deleted successfully');
                router.push('/accounts');
            })
            .catch((error) => console.error('Error deleting account:', error));
    };

    if (!account) {
        return <div style={{padding: '20px'}}>Загрузка...</div>;
    }

    // if (!permissions[`web-account-${accountId}-view`]) {
    //     return (
    //         <div style={{padding: '20px'}}>У вас нет разрешения на просмотр этого аккаунта.</div>
    //     );
    // }

    const renderInfoTab = () => {
        return (
            <div>
                <div style={{marginBottom: '20px'}}>
                    <Text variant="header-2">Основная информация</Text>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={Person} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            ФИО:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {`${account.firstName} ${account.lastName}`}
                        </Text>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={Envelope} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Email:
                        </Text>
                        <Text variant="body-1" color="link">
                            {account.email}
                        </Text>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={Handset} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Номер телефона:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.phoneNumber ?? '???'}
                        </Text>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={Calendar} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Дата рождения:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.dateOfBirth ?? '???'}
                        </Text>
                    </div>
                </div>
            </div>
        );
    };

    const renderAdditionalInfoTab = () => {
        return (
            <div>
                <div style={{marginBottom: '20px'}}>
                    <Text variant="header-2">Дополнительная информация</Text>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={Briefcase} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Штатная должность:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.jobTitle}
                        </Text>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={Clock} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Режим работы:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.workSchedule}
                        </Text>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={MapPin} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Город проживания:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.city}
                        </Text>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={ArrowUpRightFromSquare} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            Ссылки на соцсети:
                        </Text>
                        <div style={{marginLeft: '16px'}}>
                            {data.socialLinks?.vk && (
                                <div style={{marginBottom: '5px'}}>
                                    <Text variant="caption-2" color="secondary">
                                        Facebook:
                                    </Text>
                                    <Text variant="body-1" color="link">
                                        {data.socialLinks?.vk}
                                    </Text>
                                </div>
                            )}
                            {data.socialLinks?.linkedin && (
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
                    </div>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <Box marginRight="8px">
                            <Icon data={CircleInfoFill} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            О себе:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.description}
                        </Text>
                    </div>
                </div>
            </div>
        );
    };

    const renderOrgUnitsTab = () => {
        return (
            <div>
                <div style={{marginBottom: '20px'}}>
                    <Text variant="header-2">Информация об Organization Units</Text>
                </div>
                <div>
                    {accountOrgUnits.map((ou) => (
                        <div key={ou.id} style={{marginBottom: '10px'}}>
                            <Card style={{padding: '16px'}}>
                                <div
                                    style={{display: 'flex', flexDirection: 'column', gap: '10px'}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Box marginRight="8px">
                                            <Icon data={Folder} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            Название:
                                        </Text>
                                        <Text variant="body-1" color="primary">
                                            {ou.name}
                                        </Text>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Box marginRight="8px">
                                            <Icon data={FileText} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            О себе:
                                        </Text>
                                        <Text variant="body-1" color="primary">
                                            {ou.description}
                                        </Text>
                                    </div>
                                    {teamLead?.id && teamLead?.id !== account.id && (
                                        <div style={{display: 'flex', alignItems: 'center'}}>
                                            <Text variant="caption-2" color="secondary">
                                                Наставник:
                                            </Text>
                                            <User
                                                avatar={{
                                                    text: `${teamLead.firstName} ${teamLead.lastName}`,
                                                    theme: 'brand',
                                                }}
                                                name={`${teamLead.firstName} ${teamLead.lastName}`}
                                                description={teamLead.email}
                                                size="m"
                                            />
                                        </div>
                                    )}
                                    <div style={{display: 'flex', alignItems: 'center'}}>
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
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
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
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderRolesTab = () => {
        return (
            <div>
                <div style={{marginBottom: '20px'}}>
                    <Text variant="header-2">Роли</Text>
                </div>
                <div>
                    {accountRoles.map((role) => (
                        <div key={role.id} style={{marginBottom: '10px'}}>
                            <Card style={{padding: '16px'}}>
                                <div
                                    style={{display: 'flex', flexDirection: 'column', gap: '10px'}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Box marginRight="8px">
                                            <Icon data={Person} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            Название роли:
                                        </Text>
                                        <Text variant="body-1" color="primary">
                                            {role.name}
                                        </Text>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Box marginRight="8px">
                                            <Icon data={FileText} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            Описание:
                                        </Text>
                                        <Text variant="body-1" color="primary">
                                            {role.description}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderBusinessRolesTab = () => {
        return (
            <div>
                <div style={{marginBottom: '20px'}}>
                    <Text variant="header-2">Бизнес Роли</Text>
                </div>
                <div>
                    {accountBusinessRoles.map((br) => (
                        <div key={br.id} style={{marginBottom: '10px'}}>
                            <Card style={{padding: '16px'}}>
                                <div
                                    style={{display: 'flex', flexDirection: 'column', gap: '10px'}}
                                >
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Box marginRight="8px">
                                            <Icon data={Persons} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            Название бизнес-роли:
                                        </Text>
                                        <Text variant="body-1" color="primary">
                                            {br.name}
                                        </Text>
                                    </div>
                                    <div style={{display: 'flex', alignItems: 'center'}}>
                                        <Box marginRight="8px">
                                            <Icon data={FileText} />
                                        </Box>
                                        <Text variant="caption-2" color="secondary">
                                            Описание:
                                        </Text>
                                        <Text variant="body-1" color="primary">
                                            {br.description}
                                        </Text>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderActiveTabContent = () => {
        switch (activeTab) {
            case 'info':
                return renderInfoTab();
            case 'additional-info':
                return renderAdditionalInfoTab();
            case 'org-units':
                return renderOrgUnitsTab();
            case 'roles':
                return renderRolesTab();
            case 'business-roles':
                return renderBusinessRolesTab();
            default:
                return null;
        }
    };

    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <div style={{marginBottom: '20px'}}>
                <User
                    avatar={{text: `${account.firstName} ${account.lastName}`, theme: 'brand'}}
                    name={`${account.firstName} ${account.lastName}`}
                    description={account.email}
                    size="l"
                />
            </div>
            <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center'}}>
                {permissions[`web-account-${accountId}-edit`] && (
                    <Button
                        view="action"
                        size="m"
                        onClick={handleEdit}
                        style={{marginRight: '10px'}}
                    >
                        Редактировать
                    </Button>
                )}
                {permissions[`web-account-${accountId}-delete`] && (
                    <Button view="action" size="m" onClick={handleDelete}>
                        Удалить
                    </Button>
                )}
            </div>
            <TabProvider value={activeTab} onUpdate={setActiveTab}>
                <TabList>
                    <Tab value="info">Основная информация</Tab>
                    <Tab value="additional-info">Дополнительная информация</Tab>
                    <Tab value="org-units">Organization Units</Tab>
                    <Tab value="roles">Роли</Tab>
                    <Tab value="business-roles">Бизнес Роли</Tab>
                </TabList>
                <div style={{marginTop: '20px'}}>{renderActiveTabContent()}</div>
            </TabProvider>
            <Modal open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                <h2>{account ? 'Редактирование аккаунта' : 'Создание нового аккаунта'}</h2>
                <AccountForm
                    initialValue={account}
                    onSubmit={handleSubmitEdit}
                    onClose={handleCloseEditModal}
                />
                <Button view="normal" onClick={handleCloseEditModal}>
                    Закрыть
                </Button>
            </Modal>
        </div>
    );
}
