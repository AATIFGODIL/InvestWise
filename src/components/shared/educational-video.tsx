
import Image from "next/image";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";

interface EducationalVideoProps {
    title: string;
    description: string;
    image: string;
    hint: string;
}

export default function EducationalVideo({ title, description, image, hint }: EducationalVideoProps) {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-0">
                <Image
                    src={image}
                    alt={title}
                    width={600}
                    height={400}
                    className="rounded-t-lg aspect-video object-cover"
                    data-ai-hint={hint}
                />
            </CardHeader>
            <CardContent className="flex-1 p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="outline" className="w-full">
                    <PlayCircle className="mr-2 h-4 w-4" />
                    Watch Video
                </Button>
            </CardFooter>
        </Card>
    )
}
