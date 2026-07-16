import React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "outline" ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        "h-9 px-4 py-2",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
