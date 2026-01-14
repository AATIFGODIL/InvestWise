// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import TradeClient from '@/components/trade/trade-client';
import AppLayout from '@/components/layout/app-layout';


export default function TradePage() {
    return (
        <AppLayout>
            <TradeClient />
        </AppLayout>
    )
}
