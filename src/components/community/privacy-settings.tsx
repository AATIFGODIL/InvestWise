
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
import { EyeOff, ShieldBan } from "lucide-react";
import { useState } from "react";

export default function PrivacySettings() {
  const [optOutLeaderboard, setOptOutLeaderboard] = useState(false);
  const [optOutQuests, setOptOutQuests] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <EyeOff className="h-5 w-5"/>
            Privacy & Visibility
        </CardTitle>
        <CardDescription>
            Control your visibility in community features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="opt-out-leaderboard" className="font-medium flex items-center gap-2">
                <ShieldBan className="h-4 w-4" />
                Opt-out of Leaderboard
            </Label>
            <Switch
                id="opt-out-leaderboard"
                checked={optOutLeaderboard}
                onCheckedChange={setOptOutLeaderboard}
            />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="opt-out-quests" className="font-medium flex items-center gap-2">
                <ShieldBan className="h-4 w-4" />
                Opt-out of Quests
            </Label>
            <Switch
                id="opt-out-quests"
                checked={optOutQuests}
                onCheckedChange={setOptOutQuests}
            />
        </div>
      </CardContent>
    </Card>
  );
}
