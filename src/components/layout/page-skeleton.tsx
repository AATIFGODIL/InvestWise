
import { Loader2 } from "lucide-react";

export default function PageSkeleton() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
