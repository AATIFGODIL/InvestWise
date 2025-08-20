
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { type Goal, goalIcons } from "@/data/goals";
import { useGoalStore } from "@/store/goal-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DollarSign, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GoalListProps {
  goals: Goal[];
}

export default function GoalList({ goals }: GoalListProps) {
  const { toast } = useToast();
  const { updateGoal, removeGoal } = useGoalStore();
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedTarget, setEditedTarget] = useState("");

  const handleManageClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setEditedName(goal.name);
    setEditedTarget(String(goal.target));
    setIsManageOpen(true);
  };

  const handleSaveChanges = () => {
    if (!selectedGoal) return;

    updateGoal(selectedGoal.id, {
      name: editedName,
      target: Number(editedTarget),
    });

    toast({
      title: "Success!",
      description: "Your goal has been updated.",
    });
    setIsManageOpen(false);
  };

  const handleRemoveGoal = () => {
    if (!selectedGoal) return;
    removeGoal(selectedGoal.id);
    toast({
      variant: "destructive",
      title: "Goal Removed",
      description: `${selectedGoal.name} has been removed.`,
    });
    setIsManageOpen(false);
  };

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Goals</h2>
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary flex items-center justify-center">
                    {goalIcons[goal.icon] || goalIcons.default}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{goal.name}</CardTitle>
                    <CardDescription>
                      Target: ${goal.target.toLocaleString()}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleManageClick(goal)}
                >
                  Manage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={goal.progress} className="h-2" />
                <div className="flex justify-between text-sm">
                  <p className="font-medium">
                    ${goal.current.toLocaleString()}{" "}
                    <span className="text-muted-foreground">
                      ({goal.progress}%)
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Remaining: ${(goal.target - goal.current).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage {selectedGoal?.name}</DialogTitle>
            <DialogDescription>
              Update or remove your financial goal.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal-name-edit" className="text-right">
                Name
              </Label>
              <Input
                id="goal-name-edit"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal-target-edit" className="text-right">
                Target
              </Label>
              <div className="relative col-span-3">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="goal-target-edit"
                  type="number"
                  value={editedTarget}
                  onChange={(e) => setEditedTarget(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="sm:mr-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your goal. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveGoal}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
