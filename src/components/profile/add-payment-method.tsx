// InvestWise - A modern stock trading and investment education platform for young investors

"use client";
import { useEffect, useRef, useState } from "react";
import { getClientToken, vaultPaymentMethod } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export default function AddPaymentMethod({ userId, onCardSaved }: { userId: string, onCardSaved: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dropinRef = useRef<any>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function setup() {
      // Ensure the container is mounted before proceeding
      if (!containerRef.current) {
        return;
      }
      
      try {
        const token = await getClientToken();
        if (!isMounted) return;

        // Dynamically import to ensure it runs only on the client
        const dropin = await (await import("braintree-web-drop-in")).create({
          authorization: token,
          container: containerRef.current,
        });

        if (isMounted) {
          dropinRef.current = dropin;
        }
      } catch (error) {
        console.error("Failed to initialize Braintree Drop-in:", error);
         if (isMounted) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not initialize payment form. Please refresh and try again.",
            });
         }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    if (userId) {
      setup();
    }

    return () => {
        isMounted = false;
        if (dropinRef.current && typeof dropinRef.current.teardown === 'function') {
            dropinRef.current.teardown().catch((err: any) => {
                console.error("Error tearing down Braintree Drop-in:", err);
            });
            dropinRef.current = null;
        }
    };
  }, [userId, toast]);

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
        <Skeleton className="h-40 w-full skeleton-shimmer" />
      )}
      <div ref={containerRef} id="dropin-container" className={isLoading ? 'hidden' : ''}></div>
      <Button onClick={handleSave} disabled={isLoading || isSaving} className="w-full mt-4">
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Save Card
      </Button>
    </div>
  );
}
