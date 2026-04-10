import * as React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    let classes = "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
    
    // Variants
    if (variant === "default") classes += " bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5";
    if (variant === "outline") classes += " border-2 border-slate-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-700 text-slate-700 hover:-translate-y-0.5";
    if (variant === "ghost") classes += " hover:bg-slate-100 hover:text-orange-600";
    if (variant === "link") classes += " underline-offset-4 hover:underline text-orange-600";
    
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
