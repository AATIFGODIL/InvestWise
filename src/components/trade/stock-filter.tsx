
"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"

export default function StockFilter() {
    return (
        <div className="flex gap-2">
            <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search stocks or ETFs" className="pl-10" />
            </div>
            <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-5 w-5"/>
            </Button>
        </div>
    )
}
