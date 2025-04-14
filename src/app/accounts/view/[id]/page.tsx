'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO, BusinessRoleDTO, OrganizationUnitDTO, RoleDTO} from '@/generated/api';
import {usePathname, useRouter} from 'next/navigation';
import {
    Button,
    Card,
    Icon,
    Modal,
    Tab,
    TabList,
    TabPanel,
    TabProvider,
    Text,
} from '@gravity-ui/uikit';
import {useAuth} from '@/context/AuthContext';
import {Box} from '@/components/Layout/Box';
import {
    ArrowUpRightFromSquare,
    Briefcase,
    Calendar,
    ChevronLeft,
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
import {AccountForm, AccountFormDTO} from '@/components/forms/AccountForm';
import {UserBlock} from '@/components/common/UserBlock';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';
import {MyLoader} from '@/components/Loader';

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
    const {checkActions} = useAuth();

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

    const handleSubmitEdit = async (values: AccountFormDTO) => {
        try {
            // @ts-ignore
            // eslint-disable-next-line no-param-reassign
            values.data = values.anyData;
            const {anyData: _, ...newValues} = values;
            await accountsApi.updateAccount({accountId: values.id ?? '???', accountDTO: newValues});
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
        return <MyLoader />;
    }

    // if (!permissions[`web-account-${accountId}-view`]) {
    //     return (
    //         <div style={{padding: '20px'}}>У вас нет разрешения на просмотр этого аккаунта.</div>
    //     );
    // }

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
                            {data.phoneNumber ?? '???'}
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
                            {data.dateOfBirth ?? '???'}
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
                            {data.jobTitle}
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
                            {data.workSchedule}
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
                            {data.city}
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
                    </HorizontalStack>
                    <HorizontalStack align="center">
                        <Box marginRight="8px">
                            <Icon data={CircleInfoFill} />
                        </Box>
                        <Text variant="caption-2" color="secondary">
                            О себе:
                        </Text>
                        <Text variant="body-1" color="primary">
                            {data.description}
                        </Text>
                    </HorizontalStack>
                </div>
            </div>
        );
    };

    const renderOrgUnitsTab = () => {
        return (
            <div>
                <div>
                    {accountOrgUnits.map((ou) => (
                        <div key={ou.id} style={{marginBottom: '10px'}}>
                            <Card style={{padding: '16px'}}>
                                <div
                                    style={{display: 'flex', flexDirection: 'column', gap: '10px'}}
                                >
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
                                            О себе:
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
                                            <UserBlock
                                                account={teamLead}
                                                selectable={true}
                                                size="m"
                                            />
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
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <Box marginBottom="8px">
                <Button onClick={() => router.back()}>
                    <Icon data={ChevronLeft} />
                    Назад
                </Button>
            </Box>
            <HorizontalStack align="center" justify="space-between">
                <div>{account && <UserBlock account={account} selectable={true} size="l" />}</div>
                <div>
                    {checkActions([
                        {name: 'web-global-account', action: 'edit'},
                        {
                            name: `web-account-${accountId}`,
                            action: 'edit',
                        },
                    ]) && (
                        <Button
                            view="action"
                            size="m"
                            onClick={handleEdit}
                            style={{marginRight: '10px'}}
                        >
                            <Icon data={Pencil} />
                            Редактировать
                        </Button>
                    )}
                    {checkActions([
                        {name: 'web-global-account', action: 'delete'},
                        {
                            name: `web-account-${accountId}`,
                            action: 'delete',
                        },
                    ]) && (
                        <Button view="action" size="m" onClick={handleDelete}>
                            <Icon data={TrashBin} />
                            Удалить
                        </Button>
                    )}
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
            <Modal open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                <AccountForm
                    initialValue={account}
                    onSubmit={handleSubmitEdit}
                    onClose={handleCloseEditModal}
                />
            </Modal>
        </div>
    );
}
