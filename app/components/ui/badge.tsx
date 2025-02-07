import { cn } from "@/lib/utils";

interface BadgeProps {
  status?: "success" | "warning" | "error" | "info";
  text: string;
  className?: string;
}

const statusColors = {
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export function Badge({ status = "info", text, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        statusColors[status],
        className
      )}
    >
      {text}
    </span>
  );
}
