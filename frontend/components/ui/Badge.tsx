import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "outline";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    let classes = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 backdrop-blur-sm";
    
    if (variant === "default") classes += " border-slate-200/50 bg-slate-100/80 text-slate-900";
    if (variant === "success") classes += " border-emerald-200/50 bg-emerald-100/80 text-emerald-800";
    if (variant === "warning") classes += " border-amber-200/50 bg-amber-100/80 text-amber-800";
    if (variant === "error") classes += " border-red-200/50 bg-red-100/80 text-red-800";
    if (variant === "info") classes += " border-blue-200/50 bg-blue-100/80 text-blue-800";
    if (variant === "outline") classes += " border-slate-300 bg-transparent text-slate-600";

    return (
      <div ref={ref} className={`${classes} ${className}`} {...props} />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
