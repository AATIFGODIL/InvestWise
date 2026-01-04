
"use client";

import { Trophy } from "lucide-react";

interface CertificateProps {
  name: string;
  date: string;
}

export default function Certificate({ name, date }: CertificateProps) {
  return (
    <div className="bg-background rounded-2xl border-2 border-primary/20 shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full opacity-50"></div>
        <div className="absolute -bottom-12 -right-8 w-32 h-32 bg-accent/10 rounded-full opacity-50"></div>
        <div className="relative z-10">
            <p className="text-xl font-bold text-primary mb-4">InvestWise</p>
            <h1 className="text-4xl font-bold tracking-tight text-primary/90">
                CERTIFICATE
            </h1>
            <p className="text-2xl font-semibold text-primary/80">OF COMPLETION</p>

            <div className="my-12">
                <p className="text-muted-foreground">CONGRATULATIONS TO</p>
                <p className="text-4xl font-bold my-2">{name}</p>
                <p className="text-muted-foreground">
                    FOR COMPLETING 3 BEGINNER TASKS
                </p>
            </div>

            <Trophy className="h-16 w-16 text-primary mx-auto mb-6" />

            <p className="text-muted-foreground">ISSUED ON</p>
            <p className="text-lg font-semibold">{date}</p>
        </div>
    </div>
  );
}
