import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] transform-gpu relative overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground hover:from-indigo-600 hover:to-primary hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-red-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        outline:
          'border-2 border-primary bg-background text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        ghost: 'hover:bg-muted hover:shadow-soft',
        link: 'text-primary underline-offset-4 hover:underline hover:text-indigo-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-lg px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button }
export { buttonVariants }
