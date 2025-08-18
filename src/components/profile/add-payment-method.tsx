
"use client";
import { useEffect, useRef, useState } from "react";
import { getClientToken, vaultPaymentMethod } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AddPaymentMethod({ userId, onCardSaved }: { userId: string, onCardSaved: () => void }) {
  const dropinRef = useRef<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        const token = await getClientToken();

        const dropin = await (await import("braintree-web-drop-in")).create({
          authorization: token,
          container: "#dropin-container",
        });
        dropinRef.current = dropin;
      } catch (error) {
        console.error("Failed to initialize Braintree Drop-in:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not initialize payment form. Please refresh and try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    setup();
  }, [toast]);

  async function handleSave() {
    if (!dropinRef.current) {
        toast({ variant: "destructive", title: "Error", description: "Payment form not ready." });
        return;
    }

    setIsSaving(true);
    try {
      const { nonce } = await dropinRef.current.requestPaymentMethod();
      await vaultPaymentMethod({ nonce, userId });
      toast({ title: "Success!", description: "Your card has been saved securely." });
      onCardSaved();
    } catch (error: any) {
        console.error("Failed to save card:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to save card. Please check your details and try again." });
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div>
      {isLoading && (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div id="dropin-container" className={isLoading ? 'hidden' : ''}></div>
      <Button onClick={handleSave} disabled={isLoading || isSaving} className="w-full mt-4">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Card
      </Button>
    </div>
  );
}
