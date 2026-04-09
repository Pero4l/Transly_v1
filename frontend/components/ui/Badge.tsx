import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    let classes = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2";
    
    if (variant === "default") classes += " border-transparent bg-slate-100 text-slate-900";
    if (variant === "success") classes += " border-transparent bg-emerald-100 text-emerald-800";
    if (variant === "warning") classes += " border-transparent bg-amber-100 text-amber-800";
    if (variant === "error") classes += " border-transparent bg-red-100 text-red-800";
    if (variant === "info") classes += " border-transparent bg-blue-100 text-blue-800";

    return (
      <div ref={ref} className={`${classes} ${className}`} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
