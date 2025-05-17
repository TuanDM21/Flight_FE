import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
        pending:
          'border-transparent bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 [a&]:hover:bg-slate-300 dark:[a&]:hover:bg-slate-600',
        'in-progress':
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-400 [a&]:hover:bg-amber-200 dark:[a&]:hover:bg-amber-700/50',
        completed:
          'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-700/30 dark:text-emerald-400 [a&]:hover:bg-emerald-200 dark:[a&]:hover:bg-emerald-700/50',
        cancelled:
          'border-transparent bg-red-100 text-red-700 dark:bg-red-700/30 dark:text-red-400 [a&]:hover:bg-red-200 dark:[a&]:hover:bg-red-700/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot='badge'
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
