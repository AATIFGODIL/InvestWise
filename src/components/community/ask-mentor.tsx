// InvestWise - A modern stock trading and investment education platform for young investors

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mentors = [
  { name: "Jane Doe", avatar: "", specialty: "Tech Stocks" },
  { name: "John Smith", avatar: "", specialty: "ETFs & Index Funds" },
];

export default function AskMentor() {
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Question Submitted!",
      description: "Your question has been sent to the mentors.",
    });
    const form = e.target as HTMLFormElement;
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Ask a Mentor</CardTitle>
        <CardDescription>
          Get answers from verified, experienced investors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Available Mentors</h4>
          {mentors.map((mentor) => (
            <div key={mentor.name} className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={mentor.avatar} alt={mentor.name} />
                <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium flex items-center gap-1">{mentor.name} <BadgeCheck className="h-4 w-4 text-primary" /></p>
                <p className="text-xs text-muted-foreground">{mentor.specialty}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea placeholder="Type your question here..." required />
          <Button type="submit" className="w-full">Submit Question</Button>
        </form>
      </CardContent>
    </Card>
  );
}
