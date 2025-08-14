import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type VariantProps } from "class-variance-authority"
import { buttonVariants } from "@/components/ui/button"

interface LoadingButtonProps extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  loading?: boolean
  loadingText?: string
  asChild?: boolean
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, loading = false, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn("relative", className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading && loadingText ? loadingText : children}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }