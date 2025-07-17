
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";

const questions = [
  {
    id: "q1",
    type: "radio",
    text: "What best describes you right now?",
    options: [
      "A student",
      "Curious about investing",
      "Just started investing",
      "Investing occasionally",
    ],
  },
  {
    id: "q2",
    type: "radio",
    text: "How would you describe your risk tolerance?",
    options: [
      "I want zero risk – only want to save",
      "I prefer low-risk, long-term returns",
      "I’m okay with some ups and downs",
      "I want high returns and accept high risk",
    ],
  },
  {
    id: "q3",
    type: "checkbox",
    text: "What types of assets have you already invested in? (Select all that apply)",
    options: [
      "I haven’t invested in anything",
      "Mutual funds or SIPs",
      "Stocks",
      "Crypto",
    ],
  },
  {
    id: "q4",
    type: "radio",
    text: "What is your primary goal?",
    options: [
      "To learn how investing works",
      "To grow my savings slowly",
      "To build wealth over time",
      "To earn regular returns",
    ],
  },
];

export default function OnboardingQuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      router.push("/onboarding/goal");
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (question?.type === "checkbox") {
      const currentAnswers = (answers[questionId] as string[]) || [];
      const newAnswers = currentAnswers.includes(value)
        ? currentAnswers.filter((v) => v !== value)
        : [...currentAnswers, value];
      setAnswers({ ...answers, [questionId]: newAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Progress value={progress} className="w-full mb-4" />
          <CardTitle>Tell Us About Yourself</CardTitle>
          <CardDescription>
            This will help us personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">{currentQuestion.text}</h3>
            {currentQuestion.type === "radio" && (
              <RadioGroup
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, value)
                }
              >
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {currentQuestion.type === "checkbox" && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      onCheckedChange={() =>
                        handleAnswerChange(currentQuestion.id, option)
                      }
                    />
                    <Label htmlFor={option}>{option}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNext} className="w-full">
            {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
