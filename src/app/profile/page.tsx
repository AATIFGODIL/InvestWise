// InvestWise - A modern stock trading and investment education platform for young investors
"use client";

import ProfileClient from "@/components/profile/profile-client";
import AppLayout from "@/components/layout/app-layout";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

// Dynamically import the PaymentMethods component with a loading skeleton
const PaymentMethods = dynamic(() => import('@/components/profile/payment-methods'), {
    ssr: false,
    loading: () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-14 w-full" />
            </CardContent>
        </Card>
    ),
});


export default function ProfilePage() {
    const { user } = useAuth();
    
    return (
        <AppLayout variant="lightweight">
           <div className="container mx-auto p-4 space-y-8 pb-24 max-w-4xl">
              <ProfileClient />
              {user && <PaymentMethods userId={user.uid} />}
            </div>
        </AppLayout>
    )
}
