'use client';

import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {domainComponentsApi} from '@/app/apis';
import {DomainComponentForm} from '@/components/forms/DomainComponentForm';

export default function EditDomainComponentPage() {
    const router = useRouter();
    const params = useParams();
    const domainComponentId = params.id as string;
    const [initialValues, setInitialValues] = useState<{name: string; description: string} | null>(
        null,
    );

    // Загрузка данных компонента
    useEffect(() => {
        domainComponentsApi
            .getDomainComponentById({domainComponentId})
            .then((response) => {
                setInitialValues({
                    name: response.data.name || '',
                    description: response.data.description || '',
                });
            })
            .catch((error) => console.error('Ошибка при загрузке данных:', error));
    }, [domainComponentId]);

    const handleSubmit = async (values: {name: string; description: string}) => {
        await domainComponentsApi.updateDomainComponent({
            domainComponentId,
            domainComponentDTO: values,
        });
    };

    const handleDelete = async () => {
        await domainComponentsApi.deleteDomainComponent({domainComponentId});
        router.push('/domain-components'); // Перенаправление после удаления
    };

    if (!initialValues) {
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <h1 style={{padding: '20px', textAlign: 'center'}}>
                Редактирование доменного компонента
            </h1>
            <DomainComponentForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onDelete={handleDelete}
            />
        </div>
    );
}
