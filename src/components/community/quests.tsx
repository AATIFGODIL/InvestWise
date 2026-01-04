
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Trophy, ShieldCheck } from "lucide-react";
import { useQuestStore } from "@/store/quest-store";
import { useEffect } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { cn } from "@/lib/utils";

export default function Quests() {
  const { questData, updateQuestProgress } = useQuestStore();
  const beginnerQuestsComplete = questData.beginner.every(q => q.progress === 100);
  const { isClearMode, theme } = useThemeStore();
  const isLightClear = isClearMode && theme === 'light';

  useEffect(() => {
    // This will trigger a re-calculation of quest progress whenever a user visits the community page.
    updateQuestProgress();
  }, [updateQuestProgress]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Quests</CardTitle>
        <CardDescription>
          Complete lessons to earn badges and level up your skills.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-semibold">Beginner Lessons</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {questData.beginner.map((quest) => (
                <div key={quest.title}>
                  <p className="text-sm font-medium mb-1">{quest.title}</p>
                  <Progress value={quest.progress} />
                </div>
              ))}
               {beginnerQuestsComplete && (
                  <Button asChild className={cn(
                      "w-full mt-2 ring-1 ring-white/60",
                      isClearMode
                        ? isLightClear
                            ? "bg-card/60 text-foreground"
                            : "bg-white/10 text-white"
                        : ""
                  )}>
                      <Link href="/certificate">View Certificate</Link>
                  </Button>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Intermediate Lessons</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {questData.intermediate.map((quest) => (
                <div key={quest.title}>
                  <p className="text-sm font-medium mb-1">{quest.title}</p>
                  <Progress value={quest.progress} />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Pro Lessons</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              {questData.pro.map((quest) => (
                <div key={quest.title}>
                  <p className="text-sm font-medium mb-1">{quest.title}</p>
                  <Progress value={quest.progress} />
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
