
"use client";

import AppLayout from '@/components/layout/app-layout';
import TradeClient from '@/components/trade/trade-client';
import AutoTradeApprovalDialog from '@/components/trade/auto-trade-approval-dialog';


export default function TradePage() {
    return (
        <AppLayout>
            <TradeClient />
            <AutoTradeApprovalDialog />
        </AppLayout>
    )
}
