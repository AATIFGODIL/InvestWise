
import type { ReactNode } from "react";
import { Laptop, Car, Plane, Check } from "lucide-react";

export interface Goal {
    id: string;
    name: string;
    icon: string; // Changed from ReactNode to string
    current: number;
    target: number;
    progress: number;
}

export const initialGoals: Goal[] = [];

export const goalIcons: { [key: string]: ReactNode } = {
    laptop: <Laptop className="h-8 w-8 text-primary"/>,
    car: <Car className="h-8 w-8 text-primary"/>,
    plane: <Plane className="h-8 w-8 text-primary"/>,
    default: <Check className="h-8 w-8 text-primary" />,
};
