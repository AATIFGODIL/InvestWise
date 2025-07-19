
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

interface PrivacySettingsProps {
    showLeaderboard: boolean;
    setShowLeaderboard: (show: boolean) => void;
    showQuests: boolean;
    setShowQuests: (show: boolean) => void;
}

export default function PrivacySettings({ showLeaderboard, setShowLeaderboard, showQuests, setShowQuests }: PrivacySettingsProps) {

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
                Appear on Leaderboard
            </Label>
            <Switch
                id="opt-out-leaderboard"
                checked={showLeaderboard}
                onCheckedChange={setShowLeaderboard}
            />
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="opt-out-quests" className="font-medium flex items-center gap-2">
                <ShieldBan className="h-4 w-4" />
                Participate in Quests
            </Label>
            <Switch
                id="opt-out-quests"
                checked={showQuests}
                onCheckedChange={setShowQuests}
            />
        </div>
      </CardContent>
    </Card>
  );
}
