
'use client';

import { Smartphone } from "lucide-react";

export default function RotateDevicePrompt() {

  return (
    <div id="rotate-prompt">
        <div className="rotate-phone-icon">
            <Smartphone className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold mt-8">Please Rotate Your Device</h2>
        <p className="mt-2 text-lg text-white/80">
            This experience is best viewed in landscape mode.
        </p>
    </div>
  );
}
