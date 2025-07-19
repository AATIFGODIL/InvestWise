
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp } from "lucide-react";
import Link from "next/link";

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.93H12.24V14.4H18.06C17.72 16.03 16.85 17.41 15.54 18.29V21.09H19.46C21.46 19.28 22.56 16.03 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12.24 23C15.22 23 17.74 22.01 19.46 20.48L15.54 17.68C14.54 18.33 13.48 18.71 12.24 18.71C9.88 18.71 7.89 17.15 7.14 15.04H3.13V17.92C4.85 21.04 8.24 23 12.24 23Z" fill="#34A853"/>
        <path d="M7.14 15.04C6.9 14.36 6.75 13.62 6.75 12.85C6.75 12.08 6.9 11.34 7.14 10.66V7.78H3.13C2.29 9.38 1.75 11.04 1.75 12.85C1.75 14.66 2.29 16.32 3.13 17.92L7.14 15.04Z" fill="#FBBC05"/>
        <path d="M12.24 6.99C13.67 6.99 14.93 7.5 15.93 8.45L19.52 4.89C17.73 3.24 15.22 2.25 12.24 2.25C8.24 2.25 4.85 4.96 3.13 8.08L7.14 10.96C7.89 8.85 9.88 6.99 12.24 6.99Z" fill="#EA4335"/>
    </svg>
);

const AppleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.24,11.39c-.06-.18-.12-.35-.2-.52a3.51,3.51,0,0,0-2.88-1.5H12a3.49,3.49,0,0,0-3.26,2.37A5.2,5.2,0,0,0,8,14.63a5.22,5.22,0,0,0,1,3.18A4.14,4.14,0,0,0,12,19.35a4.08,4.08,0,0,0,3.15-1.57,5.54,5.54,0,0,0,1-3.32A4.23,4.23,0,0,0,15.24,11.39Zm-.53,2.44a3,3,0,0,1-.58,1.8,2.15,2.15,0,0,1-1.89.87,2.14,2.14,0,0,1-1.83-.87,3.12,3.12,0,0,1-.6-1.8,3.27,3.27,0,0,1,.63-1.89,2.12,2.12,0,0,1,1.8-.84h.1a2.15,2.15,0,0,1,1.86.87,3.12,3.12,0,0,1,.62,1.87Z"/>
        <path d="M12.15,2.05A6.8,6.8,0,0,0,9.4,2.4,5.43,5.43,0,0,0,6.6,6.38a9,9,0,0,0,1.48,5.3,8.44,8.44,0,0,0,4,4.24,8.73,8.73,0,0,0,4.69.1,6,6,0,0,0,3.61-4,1,1,0,0,0-.7-1.1,1,1,0,0,0-1.12.63,4,4,0,0,1-2.52,2.71A6.76,6.76,0,0,1,12,14.47a6.3,6.3,0,0,1-3-3.2,7,7,0,0,1-1.07-4.13A3.41,3.41,0,0,1,9.6,4.4a4.8,4.8,0,0,1,2.55-1.83,5.1,5.1,0,0,1,2.56-.2,1,1,0,0,0,.77-1.18A7.1,7.1,0,0,0,12.15,2.05Z"/>
    </svg>
);

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join InvestWise to start your investment journey today.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline">
                <GoogleIcon />
                <span className="ml-2">Google</span>
            </Button>
            <Button variant="outline">
                <AppleIcon />
                <span className="ml-2">Apple</span>
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" placeholder="JohnDoe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
          </div>
           <div className="grid gap-2">
              <Label htmlFor="id-proof">ID Verification</Label>
              <Button asChild variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                  <div>
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload Government ID
                  </div>
              </Button>
               <Input id="id-proof" type="file" className="hidden" accept="application/pdf, image/*" />
              <p className="text-xs text-muted-foreground">For security and compliance, please upload a government-issued ID.</p>
          </div>
           <div className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="#" className="underline">
                Terms and Conditions
              </Link>
              .
          </div>
          <Button asChild className="w-full">
            <Link href="/onboarding/quiz" prefetch={false}>Create account</Link>
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm">
          Already have an account?&nbsp;
          <Link href="/auth/signin" className="underline">
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
