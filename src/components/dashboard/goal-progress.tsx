import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function GoalProgress() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">Goal Progress</CardTitle>
        <Button variant="link" size="sm" className="text-primary">View All</Button>
      </CardHeader>
      <CardContent className="flex items-center gap-4 pt-2">
        <div className="flex-grow">
          <p className="text-sm text-muted-foreground">Anonymous</p>
          <p className="text-3xl font-bold">R3,200</p>
          <p className="text-sm font-semibold text-muted-foreground">64%</p>
          <Progress value={64} className="h-2 mt-2" />
        </div>
        <div className="p-3 rounded-lg bg-secondary flex items-center justify-center self-start">
            <div className="relative h-14 w-12 bg-card rounded-md border-2 border-muted-foreground/30 flex items-center justify-center">
                <Check className="h-8 w-8 text-orange-400" strokeWidth={3} />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
