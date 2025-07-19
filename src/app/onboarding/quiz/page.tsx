
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
      { text: "A student", score: 1 },
      { text: "Curious about investing", score: 2 },
      { text: "Just started investing", score: 2 },
      { text: "Investing occasionally", score: 3 },
      { text: "Investing regularly for years", score: 5 },
    ],
  },
  {
    id: "q2",
    type: "radio",
    text: "Why are you using this platform?",
    options: [
        { text: "To learn about stocks/markets", score: 1 },
        { text: "To try investing for the first time", score: 2 },
        { text: "To practice trading with small amounts", score: 2 },
        { text: "To actively manage my portfolio", score: 4 },
        { text: "To optimize/scale my trading strategy", score: 5 },
    ],
  },
  {
    id: "q3",
    type: "radio",
    text: "How long have you been investing or trading?",
    options: [
        { text: "I haven’t started yet", score: 1 },
        { text: "Less than 6 months", score: 2 },
        { text: "6–24 months", score: 3 },
        { text: "2–5 years", score: 4 },
        { text: "Over 5 years", score: 5 },
    ],
  },
  {
    id: "q4",
    type: "radio",
    text: "How confident are you in understanding terms like 'P/E ratio', 'volatility', or 'dividends'?",
    options: [
        { text: "Never heard of them", score: 1 },
        { text: "Heard of them but don’t fully understand", score: 2 },
        { text: "Understand some of them", score: 3 },
        { text: "Confidently understand all of them", score: 4 },
        { text: "I use them regularly in decision-making", score: 5 },
    ],
  },
  {
    id: "q5",
    type: "radio",
    text: "Which of the following best describes your strategy?",
    options: [
        { text: "I don’t have a strategy yet", score: 1 },
        { text: "I follow tips or social media trends", score: 2 },
        { text: "I buy and hold safe stocks or ETFs", score: 3 },
        { text: "I analyze financials before investing", score: 4 },
        { text: "I use technical/fundamental models", score: 5 },
    ],
  },
  {
    id: "q6",
    type: "radio",
    text: "What amount are you comfortable investing today?",
    options: [
        { text: "I’m not ready to invest yet", score: 1 },
        { text: "Less than ₹5,000", score: 2 },
        { text: "₹5,000 – ₹25,000", score: 3 },
        { text: "₹25,000 – ₹1,00,000", score: 4 },
        { text: "Over ₹1,00,000", score: 5 },
    ],
  },
  {
    id: "q7",
    type: "checkbox",
    text: "What types of assets have you already invested in? (Select all that apply)",
    options: [
        { text: "I haven’t invested in anything", score: 1 },
        { text: "Mutual funds or SIPs", score: 2 },
        { text: "Stocks", score: 3 },
        { text: "Crypto", score: 3 },
        { text: "Options, futures, or other derivatives", score: 5 },
        { text: "Bonds, REITs, or international stocks", score: 5 },
    ],
  },
   {
    id: "q8",
    type: "radio",
    text: "How often do you track your portfolio?",
    options: [
        { text: "I don’t have one", score: 1 },
        { text: "Once a month or less", score: 2 },
        { text: "Once a week", score: 3 },
        { text: "Daily", score: 4 },
        { text: "Multiple times a day", score: 5 },
    ],
  },
  {
    id: "q9",
    type: "radio",
    text: "How would you describe your risk tolerance?",
    options: [
        { text: "I want zero risk – only want to save", score: 1 },
        { text: "I prefer low-risk, long-term returns", score: 2 },
        { text: "I’m okay with some ups and downs", score: 3 },
        { text: "I want high returns and accept high risk", score: 4 },
        { text: "I take aggressive positions for quick gains", score: 5 },
    ],
  },
  {
    id: "q10",
    type: "radio",
    text: "Have you ever used advanced tools like stop-loss, margin trading, or technical indicators?",
    options: [
        { text: "Never heard of them", score: 1 },
        { text: "Heard of them, but never used", score: 2 },
        { text: "Tried once or twice", score: 3 },
        { text: "Use sometimes", score: 4 },
        { text: "Use frequently and confidently", score: 5 },
    ],
  },
  {
    id: "q11",
    type: "radio",
    text: "What is your primary goal?",
    options: [
        { text: "To learn how investing works", score: 1 },
        { text: "To grow my savings slowly", score: 2 },
        { text: "To build wealth over time", score: 3 },
        { text: "To earn regular returns", score: 4 },
        { text: "To generate short-term profits", score: 5 },
    ],
  },
    {
    id: "q12",
    type: "radio",
    text: "How do you usually make investment decisions?",
    options: [
        { text: "I haven’t made any yet", score: 1 },
        { text: "I ask friends or family", score: 2 },
        { text: "I follow influencers or news", score: 3 },
        { text: "I do my own research", score: 4 },
        { text: "I follow my own proven strategy", score: 5 },
    ],
  },
   {
    id: "q13",
    type: "radio",
    text: "What is your age group?",
    options: [
        { text: "13–18", score: 1 },
        { text: "19–30", score: 0 }, // Age score is not used for profiling, only for student check
        { text: "31–45", score: 0 },
        { text: "46–60", score: 0 },
        { text: "61+", score: 0 },
    ],
  },
];

type Answers = Record<string, number | number[]>;

export default function OnboardingQuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateProfileAndRedirect();
    }
  };
  
  const calculateProfileAndRedirect = () => {
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

    if(userProfile === "Student") {
        router.push("/onboarding/parental-gate");
    } else {
        router.push("/onboarding/goal");
    }
  };

  const handleAnswerChange = (questionId: string, value: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (question?.type === "checkbox") {
      const currentAnswers = (answers[questionId] as number[]) || [];
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
                        handleAnswerChange(currentQuestion.id, option.score)
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
