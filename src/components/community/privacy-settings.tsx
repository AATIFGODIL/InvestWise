
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
import { EyeOff, ShieldBan, Users, UserCheck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { usePrivacyStore, type LeaderboardVisibility } from "@/store/privacy-store";
import { useAuth } from "@/hooks/use-auth";

export default function PrivacySettings() {
    const { leaderboardVisibility, setLeaderboardVisibility, showQuests, setShowQuests } = usePrivacyStore();
    const { updatePrivacySettings } = useAuth();

    const handleLeaderboardChange = (visibility: LeaderboardVisibility) => {
        setLeaderboardVisibility(visibility);
        updatePrivacySettings({ leaderboardVisibility: visibility });
    };

    const handleQuestsChange = (show: boolean) => {
        setShowQuests(show);
        updatePrivacySettings({ showQuests: show });
    };

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
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/50 space-y-3">
            <Label className="font-medium flex items-center gap-2">
                Leaderboard Visibility
            </Label>
            <RadioGroup value={leaderboardVisibility} onValueChange={handleLeaderboardChange}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="vis-public" />
                    <Label htmlFor="vis-public" className="font-normal flex items-center gap-2"><Users className="h-4 w-4" /> Public (Show rank and username)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="anonymous" id="vis-anon" />
                    <Label htmlFor="vis-anon" className="font-normal flex items-center gap-2"><UserCheck className="h-4 w-4" /> Anonymous (Show rank, hide username)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hidden" id="vis-hidden" />
                    <Label htmlFor="vis-hidden" className="font-normal flex items-center gap-2"><EyeOff className="h-4 w-4" /> Hidden (Don't show on leaderboard)</Label>
                </div>
            </RadioGroup>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <Label htmlFor="opt-out-quests" className="font-medium flex items-center gap-2">
                <ShieldBan className="h-4 w-4" />
                Participate in Quests
            </Label>
            <Switch
                id="opt-out-quests"
                checked={showQuests}
                onCheckedChange={handleQuestsChange}
            />
        </div>
      </CardContent>
    </Card>
  );
}
