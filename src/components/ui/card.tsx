// InvestWise - A modern stock trading and investment education platform for young investors

import * as React from "react"

import { cn } from "@/lib/utils"
import { useThemeStore } from "@/store/theme-store";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => {
  const { isClearMode, theme } = useThemeStore();

  const isLightClear = isClearMode && theme === 'light';

  {/* 
      HOW TO USE THE GLASS / CLEAR MODE EFFECT:
      
      To apply this effect to any component, you need two things:
      1. Semi-transparent background color.
      2. The `backdrop-filter` CSS property.

      Below is a live example of how this is implemented in this component.
      
      The `cn` utility conditionally applies classes:
      - If `isClearMode` is true, it sets a semi-transparent background (e.g., `bg-white/10`).
      - It also removes the default border (`border-0`) and adds a subtle ring (`ring-1 ring-white/60`) to create a highlight.

      The `style` attribute conditionally applies the `backdropFilter`. This must be done via an
      inline style because Tailwind CSS does not have a baked-in class for every blur value.
    */}

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border text-card-foreground shadow-sm",
        // --- Start of Clear Mode Logic ---
        isClearMode
          ? isLightClear
            ? "border-0 bg-[#C8C8C8]/60 shadow-lg ring-1 ring-black/10" // Light mode liquid glass
            : "border-0 bg-white/10 shadow-lg ring-1 ring-white/60" // Dark mode liquid glass
          : isLightClear ? "bg-card ring-1 ring-black/40 border-0" : "bg-card", // Standard solid card
        // --- End of Clear Mode Logic ---
        className
      )}
      // COPY-THIS: For the glass look (backdrop filter)
      style={{
        backdropFilter: isClearMode ? "blur(16px)" : "none",
        ...style,
      }}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
