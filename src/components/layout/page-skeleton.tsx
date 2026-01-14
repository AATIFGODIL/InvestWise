// InvestWise - A modern stock trading and investment education platform for young investors

import { Loader2 } from "lucide-react";

export default function PageSkeleton() {
  return (
    <div className="flex items-center justify-center h-full w-full bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
