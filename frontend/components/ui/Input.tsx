import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={`flex h-11 w-full rounded-xl  border-slate-200 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-slate-400 border-2 border-slate-200 focus:bg-white disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 ${className}`}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
