import * as React from "react"
import { Badge } from "./badge"
import { cn } from "@/lib/utils"

export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info'
  text: string
  className?: string
}

const statusStyles = {
  success: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20",
  error: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20",
  info: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20",
}

export function StatusBadge({ status, text, className }: StatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        statusStyles[status],
        "border",
        className
      )}
    >
      {text}
    </Badge>
  )
}
