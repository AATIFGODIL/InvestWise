
"use client";

import { BrainCircuit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import EducationalVideo from "../shared/educational-video";

interface RiskManagementProps {
    videos: {
        title: string;
        description: string;
        image: string;
        hint: string;
    }[];
}

export default function RiskManagement({ videos }: RiskManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            AI-Powered Risk Management
        </CardTitle>
        <CardDescription>
          Learn about managing investment risks with AI-driven insights and educational content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="font-semibold text-md">Educational Videos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video) => (
                <EducationalVideo key={video.title} {...video} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
