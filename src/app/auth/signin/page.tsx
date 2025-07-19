
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function SignInPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handlePasswordReset = () => {
    toast({
      title: "Password Reset Email Sent",
      description: "Please check your inbox to reset your password.",
    });
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
           <div className="flex items-center">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="ml-auto inline-block text-sm underline">
                  Forgot your password?
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Enter your email address and we will send you instructions to reset your password.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handlePasswordReset}>Submit</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="#" className="underline">
                Terms and Conditions
              </Link>
              .
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard">Sign in</Link>
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Don&apos;t have an account?&nbsp;
          <Link href="/auth/signup" className="underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
