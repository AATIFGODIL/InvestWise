
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EyeOff } from "lucide-react";
import { useState } from "react";

export default function PrivacySettings() {
  const [optOut, setOptOut] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5"/>
            Privacy
        </CardTitle>
        <CardDescription>
            Control your visibility in community features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="opt-out" className="font-medium">
                Opt-out of Leaderboard
            </Label>
            <Switch
                id="opt-out"
                checked={optOut}
                onCheckedChange={setOptOut}
            />
        </div>
      </CardContent>
    </Card>
  );
}
