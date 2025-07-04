import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RiskAssessor() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Know Your Risk Profile</CardTitle>
        <CardDescription>
          Take our 2-minute quiz to get personalized investment suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button size="sm" className="w-full">
          <Target className="mr-2 h-4 w-4" />
          Take the Quiz
        </Button>
      </CardContent>
    </Card>
  );
}
