'use client';

import React from 'react';
import {MDBQuotasApiUploadQuotasToProductsRequest} from '@/generated/api-mdb';
import {mdbQuotasApi} from '@/app/apis';
import CreateQuotaForm, {CreateQuotaFormFields} from '@/components/forms/CreateQuotaForm';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';

interface CreateQuotaModalProps {
    productId: string;
    closeAction: () => void;
}

export const CreateQuotaModal: React.FC<CreateQuotaModalProps> = ({productId, closeAction}) => {
    // const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    const handleCloseCreateModal = () => {
        closeAction();
    };

    const handleSubmit = async (values: CreateQuotaFormFields) => {
        try {
            const request: MDBQuotasApiUploadQuotasToProductsRequest = {
                uploadQuotasToProductsRequest: {
                    products: [
                        {
                            productId: productId,
                            quotas: values.quotas,
                        },
                    ],
                },
            };
            await mdbQuotasApi.uploadQuotasToProducts(request);
            handleCloseCreateModal();
            toaster.add({
                name: 'quotes_created',
                title: 'Квоты успешно созданы',
                content: 'Операция выполнена успешно.',
                theme: 'success',
            });
        } catch (error) {
            console.error('Error creating quotas:', error);
            toaster.add({
                name: 'error_quotes_created',
                title: 'Ошибка создания квот',
                content: 'Не удалось создать квоты.',
                theme: 'danger',
            });
        }
    };

    return (
        <div style={{padding: '20px', maxWidth: '600px', margin: '0 auto'}}>
            <CreateQuotaForm
                productId={productId}
                closeAction={handleCloseCreateModal}
                submitAction={handleSubmit}
            />
        </div>
    );
};

export default CreateQuotaModal;
