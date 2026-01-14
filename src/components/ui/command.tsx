// InvestWise - A modern stock trading and investment education platform for young investors

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/theme-store";

// Define the props for CommandInput, including our custom onValueChange
interface CommandInputProps extends Omit<React.ComponentPropsWithoutRef<'input'>, 'onChange'> {
  onValueChange?: (value: string) => void;
}

const CommandInput = React.forwardRef<
  HTMLInputElement,
  CommandInputProps
>(({ className, onValueChange, ...props }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onValueChange) {
      onValueChange(event.target.value);
    }
  };

  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onChange={handleChange}
      {...props}
    />
  );
});
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
>(({ className, ...props }, ref) => {
  const { isClearMode } = useThemeStore();
  return (
      <hr
        ref={ref}
        className={cn(
            "-mx-1 h-px", 
            isClearMode ? "bg-border/50" : "bg-border", 
            className
        )}
        {...props}
      />
  )
})
CommandSeparator.displayName = "CommandSeparator"


const CommandItem = React.forwardRef<
  React.ElementRef<'div'>,
  React.HTMLAttributes<HTMLDivElement> & { onSelect?: () => void }
>(({ className, onSelect, ...props }, ref) => {
    const { isClearMode } = useThemeStore();
    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
          isClearMode ? "text-white hover:bg-primary/10" : "hover:bg-accent hover:text-accent-foreground",
          className
        )}
        onClick={onSelect}
        {...props}
      />
    )
})
CommandItem.displayName = "CommandItem"


export {
  CommandInput,
  CommandList,
  CommandItem,
  CommandSeparator,
}

    
