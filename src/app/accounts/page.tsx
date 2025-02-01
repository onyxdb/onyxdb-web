'use client';

import {useEffect, useState} from 'react';
import {accountsApi} from '@/app/apis';
import {AccountDTO} from '@/generated/api';

export default function About() {
    const [accounts, setAccounts] = useState<AccountDTO[]>([]);

    useEffect(() => {
        accountsApi.getAllAccounts().then((data) => setAccounts(data.data));
    }, []);

    return (
        <div>
            <div>Accounts Page</div>
            {accounts.map((account) => (
                <div key={account.id}>{account.email}</div>
            ))}
        </div>
    );
}
