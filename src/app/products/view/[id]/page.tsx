'use client';

import React, {useEffect, useState} from 'react';
import {accountsApi, productsApi} from '@/app/apis';
import {ProductDTO} from '@/generated/api';
import {usePathname, useRouter} from 'next/navigation';
import {Button, Icon, Loader, Modal, Tab, TabList, TabProvider} from '@gravity-ui/uikit';
import {usePermissions} from '@/hooks/usePermissions';
import {Box} from '@/components/Layout/Box';
import {ChevronLeft, Pencil, TrashBin} from '@gravity-ui/icons';
import {HorizontalStack} from '@/components/Layout/HorizontalStack';

interface ProductViewPageProps {}

// eslint-disable-next-line no-empty-pattern
export default function ProductViewPage({}: ProductViewPageProps) {
    const [product, setProduct] = useState<ProductDTO | null>(null);
    // const [owner, setOwner] = useState<AccountDTO | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // const [productMdbProject, setProductMdbProject] = useState<OrganizationUnitDTO[]>([]);
    // const [projectClusters, setProjectClusters] = useState<V1GetClusterResponse[]>([]);
    // const [productRoles, setProductRoles] = useState<RoleDTO[]>([]);
    const [activeTab, setActiveTab] = useState<string>('additional-info');
    const router = useRouter();
    const pathname = usePathname();
    const {checkActions} = usePermissions();

    const productId = pathname.split('/').pop() ?? '';

    // @ts-ignore
    // const data = product ? (product.data as ProductData) : null;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await productsApi.getProductById({productId: productId});
                setProduct(response.data ?? null);
            } catch (error) {
                console.error('Error fetching product:', error);
            }
        };

        fetchProduct();
    }, [productId]);

    // useEffect(() => {
    //     const fetchClusters = async () => {
    //         try {
    //             const response = await mdbProjectsApi.getAccountOrganizationUnits({
    //                 accountId: productId,
    //             });
    //             setProjectClusters(response.data ?? []);
    //
    //             const ownerAccountId = response.data && response.data[0].ownerId;
    //             if (ownerAccountId) {
    //                 const responseOwner = await accountsApi.getAccountById({
    //                     accountId: ownerAccountId,
    //                 });
    //                 setOwner(responseOwner.data);
    //             }
    //         } catch (error) {
    //             console.error('Error fetching account org units:', error);
    //         }
    //     };
    //
    //     fetchAccountOrgUnits();
    // }, [productId]);

    useEffect(() => {
        const fetchAccountRoles = async () => {
            try {
                // const response = await accountsApi.getAccountRoles({accountId: productId});
                // setProductRoles(response.data ?? []);
            } catch (error) {
                console.error('Error fetching account roles:', error);
            }
        };

        fetchAccountRoles();
    }, [productId]);

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };
    //
    // const handleSubmitEdit = async (values: AccountFormDTO) => {
    //     try {
    //         // @ts-ignore
    //         // eslint-disable-next-line no-param-reassign
    //         values.data = values.anyData;
    //         await accountsApi.updateAccount({accountId: values.id ?? '???', accountDTO: values});
    //         handleCloseEditModal();
    //         // Обновление данных об аккаунте
    //         const response = await accountsApi.getAccountById({accountId: values.id ?? '???'});
    //         setAccount(response.data ?? null);
    //     } catch (error) {
    //         console.error('Ошибка при редактировании аккаунта:', error);
    //     }
    // };

    const handleDelete = () => {
        accountsApi
            .deleteAccount({accountId: productId})
            .then(() => {
                console.log('Account deleted successfully');
                router.push('/accounts');
            })
            .catch((error) => console.error('Error deleting account:', error));
    };

    if (!product) {
        return (
            <HorizontalStack align="center" justify="center">
                <Loader size="l" />
            </HorizontalStack>
        );
    }

    // if (!permissions[`web-account-${accountId}-view`]) {
    //     return (
    //         <div style={{padding: '20px'}}>У вас нет разрешения на просмотр этого аккаунта.</div>
    //     );
    // }

    // const renderInfoTab = () => {
    //     return (
    //         <div>
    //             <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={Handset} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         Номер телефона:
    //                     </Text>
    //                     <Text variant="body-1" color="primary">
    //                         {data.phoneNumber ?? '???'}
    //                     </Text>
    //                 </HorizontalStack>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={Calendar} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         Дата рождения:
    //                     </Text>
    //                     <Text variant="body-1" color="primary">
    //                         {data.dateOfBirth ?? '???'}
    //                     </Text>
    //                 </HorizontalStack>
    //             </div>
    //         </div>
    //     );
    // };

    // const renderAdditionalInfoTab = () => {
    //     return (
    //         <div>
    //             <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={Briefcase} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         Штатная должность:
    //                     </Text>
    //                     <Text variant="body-1" color="primary">
    //                         {data.jobTitle}
    //                     </Text>
    //                 </HorizontalStack>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={Clock} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         Режим работы:
    //                     </Text>
    //                     <Text variant="body-1" color="primary">
    //                         {data.workSchedule}
    //                     </Text>
    //                 </HorizontalStack>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={MapPin} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         Город проживания:
    //                     </Text>
    //                     <Text variant="body-1" color="primary">
    //                         {data.city}
    //                     </Text>
    //                 </HorizontalStack>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={ArrowUpRightFromSquare} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         Ссылки на соцсети:
    //                     </Text>
    //                     <div style={{marginLeft: '16px'}}>
    //                         {data.socialLinks?.vk && (
    //                             <div style={{marginBottom: '5px'}}>
    //                                 <Text variant="caption-2" color="secondary">
    //                                     Facebook:
    //                                 </Text>
    //                                 <Text variant="body-1" color="link">
    //                                     {data.socialLinks?.vk}
    //                                 </Text>
    //                             </div>
    //                         )}
    //                         {data.socialLinks?.linkedin && (
    //                             <div>
    //                                 <Text variant="caption-2" color="secondary">
    //                                     LinkedIn:
    //                                 </Text>
    //                                 <Text variant="body-1" color="link">
    //                                     {data.socialLinks?.linkedin}
    //                                 </Text>
    //                             </div>
    //                         )}
    //                     </div>
    //                 </HorizontalStack>
    //                 <HorizontalStack align="center">
    //                     <Box marginRight="8px">
    //                         <Icon data={CircleInfoFill} />
    //                     </Box>
    //                     <Text variant="caption-2" color="secondary">
    //                         О себе:
    //                     </Text>
    //                     <Text variant="body-1" color="primary">
    //                         {data.description}
    //                     </Text>
    //                 </HorizontalStack>
    //             </div>
    //         </div>
    //     );
    // };

    // const renderOrgUnitsTab = () => {
    //     return (
    //         <div>
    //             <div>
    //                 {projectClusters.map((ou) => (
    //                     <div key={ou.id} style={{marginBottom: '10px'}}>
    //                         <Card style={{padding: '16px'}}>
    //                             <div
    //                                 style={{display: 'flex', flexDirection: 'column', gap: '10px'}}
    //                             >
    //                                 <HorizontalStack align="center">
    //                                     <Box marginRight="8px">
    //                                         <Icon data={Folder} />
    //                                     </Box>
    //                                     <Text variant="caption-2" color="secondary">
    //                                         Название:
    //                                     </Text>
    //                                     <Text variant="body-1" color="primary">
    //                                         {ou.name}
    //                                     </Text>
    //                                 </HorizontalStack>
    //                                 <HorizontalStack align="center">
    //                                     <Box marginRight="8px">
    //                                         <Icon data={FileText} />
    //                                     </Box>
    //                                     <Text variant="caption-2" color="secondary">
    //                                         О себе:
    //                                     </Text>
    //                                     <Text variant="body-1" color="primary">
    //                                         {ou.description}
    //                                     </Text>
    //                                 </HorizontalStack>
    //                                 {owner?.id && owner?.id !== account.id && (
    //                                     <HorizontalStack align="center">
    //                                         <Box marginRight="8px">
    //                                             <Icon data={Person} />
    //                                         </Box>
    //                                         <Text variant="caption-2" color="secondary">
    //                                             Наставник:
    //                                         </Text>
    //                                         <UserBlock account={owner} selectable={true} size="m" />
    //                                     </HorizontalStack>
    //                                 )}
    //                                 <HorizontalStack align="center">
    //                                     <Box marginRight="8px">
    //                                         <Icon data={Clock} />
    //                                     </Box>
    //                                     <Text variant="caption-2" color="secondary">
    //                                         Дата создания:
    //                                     </Text>
    //                                     {ou.createdAt && (
    //                                         <Text variant="body-1" color="primary">
    //                                             {new Date(ou.createdAt).toLocaleDateString()}
    //                                         </Text>
    //                                     )}
    //                                 </HorizontalStack>
    //                                 <HorizontalStack align="center">
    //                                     <Box marginRight="8px">
    //                                         <Icon data={Clock} />
    //                                     </Box>
    //                                     <Text variant="caption-2" color="secondary">
    //                                         Дата обновления:
    //                                     </Text>
    //                                     {ou.updatedAt && (
    //                                         <Text variant="body-1" color="primary">
    //                                             {new Date(ou.updatedAt).toLocaleDateString()}
    //                                         </Text>
    //                                     )}
    //                                 </HorizontalStack>
    //                             </div>
    //                         </Card>
    //                     </div>
    //                 ))}
    //             </div>
    //         </div>
    //     );
    // };
    //
    // const renderRolesTab = () => {
    //     return (
    //         <div>
    //             {accountRoles.map((role) => (
    //                 <div key={role.id} style={{marginBottom: '10px'}}>
    //                     <Card style={{padding: '16px'}}>
    //                         <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
    //                             <HorizontalStack align="center">
    //                                 <Box marginRight="8px">
    //                                     <Icon data={Person} />
    //                                 </Box>
    //                                 <Text variant="caption-2" color="secondary">
    //                                     Название роли:
    //                                 </Text>
    //                                 <Text variant="body-1" color="primary">
    //                                     {role.name}
    //                                 </Text>
    //                             </HorizontalStack>
    //                             <HorizontalStack align="center">
    //                                 <Box marginRight="8px">
    //                                     <Icon data={FileText} />
    //                                 </Box>
    //                                 <Text variant="caption-2" color="secondary">
    //                                     Описание:
    //                                 </Text>
    //                                 <Text variant="body-1" color="primary">
    //                                     {role.description}
    //                                 </Text>
    //                             </HorizontalStack>
    //                         </div>
    //                     </Card>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    return (
        <div style={{padding: '20px', display: 'flex', flexDirection: 'column'}}>
            <Box marginBottom="8px">
                <Button onClick={() => router.back()}>
                    <Icon data={ChevronLeft} />
                    Назад
                </Button>
            </Box>
            <HorizontalStack align="center" justify="space-between">
                {/*<div>{pro && <UserBlock account={account} selectable={true} size="l" />}</div>*/}
                <div>
                    {checkActions([
                        {name: 'web-global-account', action: 'edit'},
                        {
                            name: `web-account-${productId}`,
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
                            name: `web-account-${productId}`,
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
            {/*<Box marginTop="20px">{renderInfoTab()}</Box>*/}
            <Box marginTop="10px" marginBottom="10px">
                <TabProvider value={activeTab} onUpdate={setActiveTab}>
                    <TabList>
                        <Tab value="additional-info">Дополнительная информация</Tab>
                        <Tab value="org-units">Organization Units</Tab>
                        <Tab value="roles">Роли</Tab>
                        <Tab value="business-roles">Бизнес Роли</Tab>
                    </TabList>
                    {/*<Box marginTop="10px">*/}
                    {/*<TabPanel value="additional-info">{renderAdditionalInfoTab()}</TabPanel>*/}
                    {/*<TabPanel value="org-units">{renderOrgUnitsTab()}</TabPanel>*/}
                    {/*<TabPanel value="roles">{renderRolesTab()}</TabPanel>*/}
                    {/*<TabPanel value="business-roles">{renderBusinessRolesTab()}</TabPanel>*/}
                    {/*</Box>*/}
                </TabProvider>
            </Box>
            <Modal open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
                {/*<AccountForm*/}
                {/*    initialValue={account}*/}
                {/*    onSubmit={handleSubmitEdit}*/}
                {/*    onClose={handleCloseEditModal}*/}
                {/*/>*/}
            </Modal>
        </div>
    );
}
