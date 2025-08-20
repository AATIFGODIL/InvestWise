
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, PlusCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AddPaymentMethod from "./add-payment-method";
import { useUserStore } from "@/store/user-store";

interface PaymentMethodsProps {
  userId: string;
}

export default function PaymentMethods({ userId }: PaymentMethodsProps) {
  const { paymentMethodToken, fetchPaymentMethodToken, loading } = useUserStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPaymentMethodToken(userId);
  }, [userId, fetchPaymentMethodToken]);

  const handleCardSaved = useCallback(() => {
    fetchPaymentMethodToken(userId);
    setIsDialogOpen(false);
  }, [userId, fetchPaymentMethodToken]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <CreditCard className="text-primary"/>
            Payment Methods
        </CardTitle>
        <CardDescription>
          Manage your saved payment methods for funding your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        ) : paymentMethodToken ? (
          <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">Card on File</p>
                <p className="text-sm text-muted-foreground">
                  Ready for investments
                </p>
              </div>
            </div>
            <Button variant="outline" disabled>
              Default
            </Button>
          </div>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Card</DialogTitle>
                <DialogDescription>
                  Your payment information is securely handled by Braintree.
                </DialogDescription>
              </DialogHeader>
              <AddPaymentMethod userId={userId} onCardSaved={handleCardSaved} />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
