// Para inputs de varias lineas

import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full",
        "border border-gray-200",
        "bg-white",
        "px-3 py-2 text-base",
        "shadow-sm",
        "transition-colors",
        "placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:text-sm",
        "rounded-xl",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
