import * as React from 'react'
import { cn } from '@/lib/utils'

const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex border-b border-border', className)} {...props} />
  )
)
Tabs.displayName = 'Tabs'

interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ className, active, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground',
        className
      )}
      {...props}
    />
  )
)
Tab.displayName = 'Tab'

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4', className)} {...props} />
  )
)
TabsContent.displayName = 'TabsContent'

export { Tabs, Tab, TabsContent }
