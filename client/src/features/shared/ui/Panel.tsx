import type { HTMLAttributes } from 'react'
import { cn } from '../../../lib/cn'

export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('panel rounded-3xl p-5 sm:p-6', className)} {...props} />
}
