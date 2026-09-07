import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:focus:ring-zinc-300',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-zinc-900 text-zinc-50 hover:bg-zinc-900/80 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/80',
        secondary:
          'border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-100/80 dark:bg-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-800/80',
        destructive:
          'border-transparent bg-rose-500 text-white hover:bg-rose-500/80 dark:bg-rose-900 dark:text-rose-100 dark:hover:bg-rose-900/80',
        outline: 'text-zinc-950 dark:text-zinc-50 border-zinc-300 dark:border-zinc-700',
        critical:
          'border-rose-500/40 bg-rose-500/10 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
        warning:
          'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
        success:
          'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
        info:
          'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800/60'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
