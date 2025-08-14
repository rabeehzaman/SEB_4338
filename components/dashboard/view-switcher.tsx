'use client'

import { cn } from '@/lib/utils'

interface ViewOption {
  id: string
  label: string
  icon?: React.ReactNode
}

interface ViewGroup {
  id: string
  label: string
  color: string
  views: ViewOption[]
}

interface ViewSwitcherProps {
  viewGroups: ViewGroup[]
  activeView: string
  onViewChange: (viewId: string) => void
}

export function ViewSwitcher({ viewGroups, activeView, onViewChange }: ViewSwitcherProps) {
  const getButtonStyles = (isActive: boolean, groupColor: string) => {
    const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    if (isActive) {
      if (groupColor === 'blue') {
        return cn(baseStyles, "bg-blue-100 text-blue-900 shadow-sm hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100")
      } else if (groupColor === 'green') {
        return cn(baseStyles, "bg-green-100 text-green-900 shadow-sm hover:bg-green-100 dark:bg-green-900 dark:text-green-100")
      }
      return cn(baseStyles, "bg-background text-foreground shadow-sm")
    }
    
    if (groupColor === 'blue') {
      return cn(baseStyles, "hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-200")
    } else if (groupColor === 'green') {
      return cn(baseStyles, "hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-200")
    }
    
    return cn(baseStyles, "hover:bg-background/50")
  }
  
  return (
    <div className="flex flex-col gap-3 w-full">
      {viewGroups.map((group) => (
        <div key={group.id} className="flex items-center gap-2">
          {/* Group label */}
          <span className="text-xs text-muted-foreground uppercase font-semibold min-w-[80px]">
            {group.label}:
          </span>
          
          {/* Group tabs */}
          <div className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            {group.views.map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={getButtonStyles(activeView === view.id, group.color)}
                title={view.label}
              >
                {view.icon && <span className="mr-2 sm:mr-2">{view.icon}</span>}
                <span className="hidden lg:inline">{view.label}</span>
                <span className="hidden sm:inline lg:hidden">{view.label.split(' ').map(w => w[0]).join('')}</span>
                <span className="sm:hidden">{view.icon}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}