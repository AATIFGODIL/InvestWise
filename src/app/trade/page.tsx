
"use client";

import TradeClient from '@/components/trade/trade-client';
import AutoTradeApprovalDialog from '@/components/trade/auto-trade-approval-dialog';


export default function TradePage() {
    return (
        <>
            <TradeClient />
            <AutoTradeApprovalDialog />
        </>
    )
}
