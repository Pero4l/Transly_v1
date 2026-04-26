import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let classes = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-50 disabled:pointer-events-none active:scale-95";

    
    // Variants
    if (variant === "default") classes += " bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md";
    if (variant === "outline") classes += " border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 hover:text-slate-900 text-slate-700";
    if (variant === "ghost") classes += " hover:bg-slate-50 hover:text-orange-600";
    if (variant === "link") classes += " underline-offset-4 hover:underline text-orange-600";
    if (variant === "destructive") classes += " bg-red-600 text-white hover:bg-red-700 shadow-sm";

    
    // Sizes
    if (size === "default") classes += " h-10 py-2 px-4";
    if (size === "sm") classes += " h-9 px-3 rounded-md";
    if (size === "lg") classes += " h-12 px-8 rounded-md text-base";
    if (size === "icon") classes += " h-10 w-10";

    return (
      <button
        ref={ref}
        className={`${classes} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
