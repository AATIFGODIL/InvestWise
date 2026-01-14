// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EyeOff, ShieldBan, Users, UserCheck, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { usePrivacyStore, type LeaderboardVisibility } from "@/store/privacy-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";

export default function PrivacySettings() {
    const { leaderboardVisibility: initialVisibility, showQuests: initialShowQuests, setLeaderboardVisibility, setShowQuests } = usePrivacyStore();
    const { updatePrivacySettings } = useAuth();
    const { toast } = useToast();

    const [visibility, setVisibility] = useState<LeaderboardVisibility>(initialVisibility);
    const [questsEnabled, setQuestsEnabled] = useState<boolean>(initialShowQuests);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setVisibility(initialVisibility);
        setQuestsEnabled(initialShowQuests);
    }, [initialVisibility, initialShowQuests]);

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            const newSettings = {
                leaderboardVisibility: visibility,
                showQuests: questsEnabled,
            };
            await updatePrivacySettings(newSettings);

            // Update the Zustand store after successful save
            setLeaderboardVisibility(visibility);
            setShowQuests(questsEnabled);

            toast({
                title: "Success!",
                description: "Your privacy settings have been updated.",
            });
        } catch (error) {
            console.error("Failed to save privacy settings:", error);
            toast({
                variant: "destructive",
                title: "Oh no!",
                description: "Could not save your settings. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const hasChanges = visibility !== initialVisibility || questsEnabled !== initialShowQuests;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                    <EyeOff className="h-5 w-5" />
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
                    <RadioGroup value={visibility} onValueChange={(value: LeaderboardVisibility) => setVisibility(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="vis-public-comm" />
                            <Label htmlFor="vis-public-comm" className="font-normal flex items-center gap-2"><Users className="h-4 w-4" /> Public (Show rank and username)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="anonymous" id="vis-anon-comm" />
                            <Label htmlFor="vis-anon-comm" className="font-normal flex items-center gap-2"><UserCheck className="h-4 w-4" /> Anonymous (Show rank, hide username)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hidden" id="vis-hidden-comm" />
                            <Label htmlFor="vis-hidden-comm" className="font-normal flex items-center gap-2"><EyeOff className="h-4 w-4" /> Hidden (Don't show on leaderboard)</Label>
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
                        checked={questsEnabled}
                        onCheckedChange={setQuestsEnabled}
                    />
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button onClick={handleSaveChanges} disabled={!hasChanges || isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}
