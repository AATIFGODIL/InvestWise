import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}
