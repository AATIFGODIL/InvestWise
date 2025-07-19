
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Repeat, DollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
                 <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Set Up New Auto-Invest
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Set Up New Auto-Invest</DialogTitle>
                            <DialogDescription>
                                Schedule a recurring investment to automate your growth.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="investment-name" className="text-right">
                                    Investment
                                </Label>
                                <Input
                                    id="investment-name"
                                    defaultValue="S&P 500 ETF"
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="amount" className="text-right">
                                    Amount
                                </Label>
                                <div className="relative col-span-3">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="50"
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="frequency" className="text-right">
                                    Frequency
                                </Label>
                                <Select>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}
