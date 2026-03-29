"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, checked, defaultChecked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked ?? false)
    const controlled = checked !== undefined
    const on = controlled ? checked : isChecked

    return (
      <label
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
          on ? "bg-primary" : "bg-input",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <input
          type="checkbox"
          className="sr-only"
          ref={ref}
          checked={on}
          onChange={(e) => {
            if (!controlled) setIsChecked(e.target.checked)
            onCheckedChange?.(e.target.checked)
            props.onChange?.(e)
          }}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
            on ? "translate-x-5" : "translate-x-0"
          )}
        />
      </label>
    )
  }
)
Switch.displayName = "Switch"

export { Switch }
