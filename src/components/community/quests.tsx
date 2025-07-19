
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
import { BookOpen, Trophy, ShieldCheck } from "lucide-react";

const questData = {
  beginner: [
    { title: "Complete your profile", progress: 100 },
    { title: "Take the risk assessment quiz", progress: 100 },
    { title: "Make your first investment", progress: 25 },
  ],
  intermediate: [
    { title: "Diversify your portfolio with 3+ assets", progress: 0 },
    { title: "Set up a recurring investment", progress: 0 },
    { title: "Watch 5 educational videos", progress: 40 },
  ],
  pro: [
    { title: "Reach a portfolio value of $10,000", progress: 15 },
    { title: "Hold an investment for over 1 year", progress: 0 },
    { title: "Successfully complete 50 trades", progress: 10 },
  ],
};

export default function Quests() {
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
