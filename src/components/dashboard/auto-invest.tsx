// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Repeat, DollarSign, Trash2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAutoInvestStore, type AutoInvestment } from "@/store/auto-invest-store";

export default function AutoInvest() {
    const { toast } = useToast();
    const { autoInvestments, addAutoInvestment, updateAutoInvestment, removeAutoInvestment } = useAutoInvestStore();

    const [isManageOpen, setIsManageOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedInvestment, setSelectedInvestment] = useState<AutoInvestment | null>(null);

    // State for the creation form
    const [newSymbol, setNewSymbol] = useState("");
    const [newAmount, setNewAmount] = useState<number | string>("");
    const [newFrequency, setNewFrequency] = useState("");

    const handleManageClick = (investment: AutoInvestment) => {
        setSelectedInvestment(investment);
        setIsManageOpen(true);
    };

    const handleSaveChanges = () => {
        if (!selectedInvestment) return;
        updateAutoInvestment(selectedInvestment.id, selectedInvestment);
        toast({
            title: "Success!",
            description: "Your auto-invest settings have been updated.",
        });
        setIsManageOpen(false);
    };

    const handleRemoveInvestment = () => {
        if (!selectedInvestment) return;
        removeAutoInvestment(selectedInvestment.id);
        toast({
            variant: "destructive",
            title: "Investment Removed",
            description: `${selectedInvestment.symbol} has been removed from your auto-investments.`,
        });
        setIsManageOpen(false);
    }

    const handleCreateInvestment = () => {
        if (!newSymbol || !newAmount || !newFrequency) {
            toast({
                variant: "destructive",
                title: "Missing Information",
                description: "Please fill out all fields to create a new auto-investment.",
            });
            return;
        }
        addAutoInvestment({
            symbol: newSymbol.toUpperCase(),
            amount: Number(newAmount),
            frequency: newFrequency as "Daily" | "Weekly" | "Bi-weekly" | "Monthly",
        });
        toast({
            title: "Success!",
            description: `Auto-investment for ${newSymbol.toUpperCase()} has been created.`,
        });
        // Reset form and close dialog
        setNewSymbol("");
        setNewAmount("");
        setNewFrequency("");
        setIsCreateOpen(false);
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <Repeat className="h-5 w-5 text-primary" />
                    Auto-Invest
                </CardTitle>
                <CardDescription>
                    Set up recurring investments to grow your portfolio automatically.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {autoInvestments.map((investment) => (
                    <div key={investment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                            <p className="font-semibold">{investment.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                                ${investment.amount} / {investment.frequency}
                            </p>
                        </div>
                        <div className="text-right">
                            <Badge variant="secondary">Next: {new Date(investment.nextDate).toLocaleDateString()}</Badge>
                            <Button variant="link" size="sm" className="h-auto p-0 mt-1" onClick={() => handleManageClick(investment)}>Manage</Button>
                        </div>
                    </div>
                ))}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
                                <Label htmlFor="investment-symbol" className="text-right">
                                    Symbol
                                </Label>
                                <Input
                                    id="investment-symbol"
                                    placeholder="e.g. AAPL"
                                    className="col-span-3"
                                    value={newSymbol}
                                    onChange={(e) => setNewSymbol(e.target.value)}
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
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="frequency" className="text-right">
                                    Frequency
                                </Label>
                                <Select value={newFrequency} onValueChange={setNewFrequency}>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" onClick={handleCreateInvestment}>Save Changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>

            {/* Manage Dialog */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Manage {selectedInvestment?.symbol}</DialogTitle>
                        <DialogDescription>
                            Update or remove your recurring investment.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedInvestment && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="manage-amount" className="text-right">
                                    Amount
                                </Label>
                                <div className="relative col-span-3">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="manage-amount"
                                        type="number"
                                        value={selectedInvestment.amount}
                                        onChange={(e) => setSelectedInvestment({ ...selectedInvestment, amount: Number(e.target.value) })}
                                        className="pl-9"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="manage-frequency" className="text-right">
                                    Frequency
                                </Label>
                                <Select
                                    value={selectedInvestment.frequency}
                                    onValueChange={(value) => setSelectedInvestment({ ...selectedInvestment, frequency: value as any })}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                        <SelectItem value="Weekly">Weekly</SelectItem>
                                        <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="justify-between sm:justify-between">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="sm:mr-auto">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently remove your auto-investment for {selectedInvestment?.symbol}. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleRemoveInvestment}>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <div className="flex gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="button" onClick={handleSaveChanges}>Save Changes</Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
