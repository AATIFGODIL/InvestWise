// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, FileUp } from "lucide-react";

export default function ParentalGatePage() {
  const router = useRouter();

  const handleContinue = () => {
    // Logic to handle parental verification would go here
    // For now, we'll just redirect to the dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-4">
                <Shield className="h-10 w-10" />
            </div>
          <CardTitle>Parental Control Required</CardTitle>
          <CardDescription>
            To continue, please have a parent or guardian verify their identity. This is for your safety and to comply with regulations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="parent-email">Parent's Email</Label>
            <Input id="parent-email" type="email" placeholder="parent@example.com" />
          </div>
           <div className="space-y-2">
              <Label htmlFor="parent-id-proof">Parent's ID Proof</Label>
               <Button asChild variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                  <Label htmlFor="parent-id-proof" className="cursor-pointer flex items-center w-full">
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload Parent's Government ID
                  </Label>
              </Button>
               <Input id="parent-id-proof" type="file" className="hidden" accept="application/pdf, image/*" />
              <p className="text-xs text-muted-foreground">An email will be sent to your parent for verification.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleContinue}>Submit for Verification</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
