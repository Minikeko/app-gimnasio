import type { HTMLAttributes, ReactNode } from 'react'
import { clsx } from 'clsx'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: boolean
}

export function Card({ children, padding = true, className, ...props }: Props) {
  return (
    <div
      className={clsx(
        'bg-gray-800 rounded-2xl border border-gray-700',
        padding && 'p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
