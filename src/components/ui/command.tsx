

"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

const CommandInput = React.forwardRef<
  React.ElementRef<'input'>,
  React.ComponentPropsWithoutRef<'input'>
>(({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
))
CommandInput.displayName = "CommandInput"

const CommandList = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
CommandList.displayName = "CommandList"

const CommandSeparator = React.forwardRef<
  React.ElementRef<'hr'>,
  React.ComponentPropsWithoutRef<'hr'>
>(({ className, ...props }, ref) => (
  <hr
    ref={ref}
    className={cn("-mx-1 h-px bg-border/50", className)}
    {...props}
  />
))
CommandSeparator.displayName = "CommandSeparator"


const CommandItem = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-white/20 aria-selected:text-primary-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
))
CommandItem.displayName = "CommandItem"


export {
  CommandInput,
  CommandList,
  CommandItem,
  CommandSeparator,
}

    