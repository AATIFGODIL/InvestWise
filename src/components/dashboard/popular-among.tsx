// InvestWise - A modern stock trading and investment education platform for young investors

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, User } from "lucide-react";
import Link from "next/link";

export default function PopularAmong() {
  return (
    <Link href="/community?tab=trends" className="block hover:ring-2 hover:ring-primary rounded-lg transition-all">
        <Card className="h-full">
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
    </Link>
  );
}
