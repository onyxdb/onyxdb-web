'use client';

import React, {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {AccountDTO} from '@/generated/api';
import {accountsApi} from '@/app/apis';

export default function AccountInfoPage() {
    const params = useParams();
    const accountId = params.id as string;
    const [account, setAccount] = useState<AccountDTO | null>(null);

    useEffect(() => {
        accountsApi
            .getAccountById({accountId})
            .then((response) => setAccount(response.data))
            .catch((error) => console.error('Error fetching account:', error));
    }, [accountId]);

    if (!account) {
        return <div>Загрузка...</div>;
    }

    return (
        <div style={{padding: '20px'}}>
            <h1>{account.username}</h1>
            <p>{account.email}</p>
            <p>{account.firstName}</p>
            <p>{account.lastName}</p>
            <p>Дата создания: {account.createdAt}</p>
        </div>
    );
}
