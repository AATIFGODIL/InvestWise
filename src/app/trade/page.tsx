
import { Suspense } from "react";
import TradePageContent from "@/components/trade/trade-client";


export default function TradePage() {
    return (
        <Suspense>
            <TradePageContent />
        </Suspense>
    )
}
