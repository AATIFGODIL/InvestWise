
"use client";

import { useState } from "react";
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
import { FileUp, Loader2, CheckCircle } from "lucide-react";

export default function OnboardingIdVerificationPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        setUploadSuccess(false);
        setIsUploading(true);
        // Simulate upload and verification
        setTimeout(() => {
            setIsUploading(false);
            setUploadSuccess(true);
        }, 1500);
    }
  };

  const handleContinue = () => {
    // Here you would typically save the file reference to the user's profile
    router.push("/onboarding/quiz");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Identity</CardTitle>
          <CardDescription>
            For security, please upload a form of ID. This helps us keep your account safe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="id-proof">ID Proof</Label>
              <Button asChild variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                  <Label htmlFor="id-proof" className="cursor-pointer flex items-center w-full">
                      <FileUp className="h-4 w-4 mr-2" />
                      Attach file or photo
                  </Label>
              </Button>
              <Input id="id-proof" type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" />
              {isUploading && (
                  <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying upload...
                  </div>
              )}
              {uploadSuccess && file && (
                  <div className="flex items-center text-sm text-green-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {file.name} uploaded successfully.
                  </div>
              )}
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleContinue} disabled={!uploadSuccess}>Continue</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
