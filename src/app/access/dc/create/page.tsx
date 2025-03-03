'use client';

import React from 'react';
import {domainComponentsApi} from '@/app/apis';
import {DomainComponentForm} from '@/components/forms/DomainComponentForm';

export default function CreateDomainComponentPage() {
    const handleSubmit = async (values: {name: string; description: string}) => {
        await domainComponentsApi.createDomainComponent({domainComponentDTO: values});
    };

    return (
        <div>
            <h1 style={{padding: '20px', textAlign: 'center'}}>
                Создание нового доменного компонента
            </h1>
            <DomainComponentForm onSubmit={handleSubmit} />
        </div>
    );
}
