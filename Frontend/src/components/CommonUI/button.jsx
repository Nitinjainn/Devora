"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden cursor-pointer", 
  {
    variants: {
      variant: {
        default: "bg-[#1b0c3f] text-white hover:bg-[#0d061f]",
        blue: "bg-indigo-600 hover:bg-indigo-700 text-white",
        destructive: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
        outline: "border border-gray-300 bg-white text-black hover:bg-gray-100",
        secondary: "bg-gray-100 text-black hover:bg-gray-200",
        ghost: "text-black hover:bg-gray-100",
        link: "text-[#7c3aed] underline-offset-4 hover:underline",
        og: "text-indigo-600 bg-indigo-100 ",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "py-2 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleRipple = (e) => {
      const button = e.currentTarget
      const ripple = document.createElement("span")
      const diameter = Math.max(button.clientWidth, button.clientHeight)
      const radius = diameter / 2

      ripple.style.width = ripple.style.height = `${diameter}px`
      ripple.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`
      ripple.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`
      ripple.classList.add("ripple")

      const existingRipple = button.getElementsByClassName("ripple")[0]
      if (existingRipple) {
        existingRipple.remove()
      }

      button.appendChild(ripple)
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        onClick={(e) => {
          handleRipple(e)
          props.onClick?.(e)
        }}
        {...props} // loading is not spread here
      >
        {loading ? <span className="animate-spin mr-2">⏳</span> : null}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
