import { Laptop, Car, Plane, Check } from "lucide-react";

export interface Goal {
    id: string;
    name: string;
    icon: React.ReactNode;
    current: number;
    target: number;
    progress: number;
}

export const initialGoals: Goal[] = [
    {
        id: "laptop",
        name: "New Laptop",
        icon: <Laptop className="h-8 w-8 text-primary"/>,
        current: 3200,
        target: 5000,
        progress: 64
    },
    {
        id: "car",
        name: "First Car",
        icon: <Car className="h-8 w-8 text-primary"/>,
        current: 8000,
        target: 20000,
        progress: 40
    },
    {
        id: "trip",
        name: "Trip to Japan",
        icon: <Plane className="h-8 w-8 text-primary"/>,
        current: 1500,
        target: 12000,
        progress: 12.5
    },
];

export const goalIcons: { [key: string]: React.ReactNode } = {
    laptop: <Laptop className="h-8 w-8 text-primary"/>,
    car: <Car className="h-8 w-8 text-primary"/>,
    plane: <Plane className="h-8 w-8 text-primary"/>,
    default: <Check className="h-8 w-8 text-primary" />,
};
