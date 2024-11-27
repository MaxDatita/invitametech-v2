// Para botones de la app

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent'
}

const buttonVariants = {
  primary: "bg-purple-400 hover:bg-purple-700 text-white border-transparent rounded-2xl",
  secondary: "bg-white hover:bg-gray-100 text-purple-600 border border-purple-600 rounded-2xl",
  accent: "bg-pink-600 hover:bg-pink-700 text-white border-transparent rounded-2xl"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        className={cn(
          "px-4 py-2 rounded-md transition-colors font-medium",
          buttonVariants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"
