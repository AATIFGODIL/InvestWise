
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
import { questions } from "@/data/quiz";
import useLoadingStore from "@/store/loading-store";

type Answers = Record<string, number | number[]>;

export default function OnboardingQuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const { showLoading } = useLoadingStore();

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleNavigate();
    }
  };

  const handleNavigate = () => {
    showLoading(); // Show loading screen immediately
    calculateProfile();
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile === "Student") {
        router.push("/onboarding/parental-gate");
    } else {
        router.push("/onboarding/theme");
    }
  }
  
  const calculateProfile = () => {
    let totalScore = 0;
    let questionCount = 0;

    for (const questionId in answers) {
        // Exclude age question (q13) from profile scoring
        if (questionId === 'q13') continue;

        const answer = answers[questionId];
        if (Array.isArray(answer)) {
            totalScore += answer.reduce((sum, val) => sum + val, 0) / answer.length;
        } else {
            totalScore += answer;
        }
        questionCount++;
    }

    const averageScore = questionCount > 0 ? totalScore / questionCount : 0;
    let userProfile = "Experienced Investor";

    if (averageScore >= 1.0 && averageScore <= 1.4) {
        userProfile = "Student";
    } else if (averageScore >= 1.5 && averageScore <= 2.4) {
        userProfile = "Beginner";
    } else if (averageScore >= 2.5 && averageScore <= 3.4) {
        userProfile = "Amateur";
    } else if (averageScore >= 3.5 && averageScore <= 4.4) {
        userProfile = "New Investor";
    }
    
    // Store profile in localStorage to be used across the app
    localStorage.setItem('userProfile', userProfile);
  };

  const handleAnswerChange = (questionId: string, value: number, isExclusive: boolean = false) => {
    const question = questions.find((q) => q.id === questionId);
    if (question?.type === "checkbox") {
        let currentAnswers = (answers[questionId] as number[]) || [];

        if (isExclusive) {
            // If the exclusive option is selected, either set it as the only answer or clear it if it's already there
            currentAnswers = currentAnswers.includes(value) ? [] : [value];
        } else {
            // If a non-exclusive option is selected, remove the exclusive option if it's present
            const exclusiveOption = question.options.find(opt => opt.exclusive)?.score;
            if (exclusiveOption) {
                currentAnswers = currentAnswers.filter(v => v !== exclusiveOption);
            }
            
            // Toggle the current non-exclusive option
            if (currentAnswers.includes(value)) {
                currentAnswers = currentAnswers.filter((v) => v !== value);
            } else {
                currentAnswers.push(value);
            }
        }

        setAnswers({ ...answers, [questionId]: currentAnswers });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const isAnswered = currentQuestion.id in answers && (
    (Array.isArray(answers[currentQuestion.id]) && (answers[currentQuestion.id] as number[]).length > 0) ||
    (!Array.isArray(answers[currentQuestion.id]))
  );


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <Progress value={progress} className="w-full mb-4" />
          <CardTitle>Tell Us About Yourself</CardTitle>
          <CardDescription>
            This will help us personalize your experience. ({currentQuestionIndex + 1} of {questions.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">{currentQuestion.text}</h3>
            {currentQuestion.type === "radio" && (
              <RadioGroup
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, parseInt(value))
                }
                value={String(answers[currentQuestion.id] || '')}
              >
                {currentQuestion.options.map((option) => (
                  <div key={option.text} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(option.score)} id={option.text} />
                    <Label htmlFor={option.text}>{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {currentQuestion.type === "checkbox" && (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <div key={option.text} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.text}
                      onCheckedChange={() =>
                        handleAnswerChange(currentQuestion.id, option.score, !!option.exclusive)
                      }
                      checked={((answers[currentQuestion.id] as number[]) || []).includes(option.score)}
                    />
                    <Label htmlFor={option.text}>{option.text}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleNext} className="w-full" disabled={!isAnswered}>
            {currentQuestionIndex < questions.length - 1 ? "Next" : "Finish"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
