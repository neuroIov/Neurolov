"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  min: number;
  step: number;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, max, min, step, ...props }, ref) => {
    const [isDragging, setIsDragging] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);

    const getValueFromPosition = (position: number) => {
      if (!sliderRef.current) return min;
      
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = (position - rect.left) / rect.width;
      const rawValue = min + (max - min) * percentage;
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    };

    const handleMouseDown = (event: React.MouseEvent) => {
      setIsDragging(true);
      const newValue = getValueFromPosition(event.clientX);
      onValueChange([newValue]);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging) return;
      const newValue = getValueFromPosition(event.clientX);
      onValueChange([newValue]);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging]);

    const percentage = ((value[0] - min) / (max - min)) * 100;

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <div
          ref={sliderRef}
          className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-800"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-full bg-blue-600 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="absolute h-4 w-4 rounded-full border border-blue-600/50 bg-blue-600 ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-blue-500"
          style={{ left: `calc(${percentage}% - 0.5rem)` }}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";
