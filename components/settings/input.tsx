import React from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const InputUS = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { theme } = useTheme();
    return (
      <input
        type={type}
        className={cn(
          `w-full p-3 rounded-full focus:outline-none ${
            theme === "dark"
              ? "border-[#686868] border-[1px] text-white/50 bg-gray-950"
              : "border-gray-900 bg-slate-300 text-gray-900"
          }`,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

InputUS.displayName = "InputUS";
export default InputUS;
