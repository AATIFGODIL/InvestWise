
import { Suspense } from "react";
import TradePageContent from "@/components/trade/trade-client";
import AppLayout from "@/components/layout/app-layout";


export default function TradePage() {
    return (
        <AppLayout>
            <Suspense>
                <TradePageContent />
            </Suspense>
        </AppLayout>
    )
}
