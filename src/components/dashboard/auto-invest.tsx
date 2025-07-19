
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Repeat } from "lucide-react";

const autoInvestments = [
    {
        name: "Tech Starter Pack",
        amount: 50,
        frequency: "Weekly",
        nextDate: "July 25, 2025"
    },
    {
        name: "S&P 500 ETF",
        amount: 100,
        frequency: "Monthly",
        nextDate: "August 01, 2025"
    }
]

export default function AutoInvest() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-primary" />
                    Auto-Invest
                </CardTitle>
                <CardDescription>
                    Set up recurring investments to grow your portfolio automatically.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {autoInvestments.map((investment) => (
                    <div key={investment.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{investment.name}</p>
                            <p className="text-sm text-muted-foreground">
                                ${investment.amount} / {investment.frequency}
                            </p>
                        </div>
                        <div className="text-right">
                           <Badge variant="secondary">Next: {investment.nextDate}</Badge>
                           <Button variant="link" size="sm" className="h-auto p-0 mt-1">Manage</Button>
                        </div>
                    </div>
                ))}
                 <Button className="w-full" variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Set Up New Auto-Invest
                </Button>
            </CardContent>
        </Card>
    )
}
