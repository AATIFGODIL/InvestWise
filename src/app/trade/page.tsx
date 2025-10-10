
"use client";

import TradeClient from '@/components/trade/trade-client';
import AutoTradeApprovalDialog from '@/components/trade/auto-trade-approval-dialog';
import AppLayout from '@/components/layout/app-layout';


export default function TradePage() {
    return (
        <AppLayout>
            <TradeClient />
            <AutoTradeApprovalDialog />
        </AppLayout>
    )
}
