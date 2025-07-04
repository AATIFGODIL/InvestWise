import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, User } from "lucide-react";

export default function PopularAmong() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Popular Among 18-25</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-4">
        <div className="flex -space-x-3">
            <span className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background"><User className="h-5 w-5 text-primary"/></span>
            <span className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border-2 border-background"><User className="h-5 w-5 text-accent"/></span>
            <span className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-background"><User className="h-5 w-5 text-green-500"/></span>
        </div>
        <TrendingUp className="h-12 w-12 text-orange-400" />
      </CardContent>
    </Card>
  );
}
