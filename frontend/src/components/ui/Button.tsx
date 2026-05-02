"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center font-semibold tracking-tight select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF9900] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 active:scale-[0.97]";

    const variants = {
      primary:
        "bg-[#FF9900] hover:bg-[#E68A00] text-[#111111] shadow-sm hover:shadow-md",
      secondary:
        "bg-[#111111] hover:bg-[#222222] text-white shadow-sm hover:shadow-md",
      outline:
        "border-2 border-[#FF9900] text-[#FF9900] hover:bg-[#FF9900] hover:text-[#111111] bg-transparent",
      ghost:
        "bg-transparent hover:bg-[#F7F7F7] text-[#555555] hover:text-[#111111]",
      danger:
        "bg-[#CC0C39] hover:bg-[#A8002E] text-white shadow-sm hover:shadow-md",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-5 py-2.5 rounded-xl gap-2",
      lg: "text-base px-7 py-3 rounded-xl gap-2.5",
      xl: "text-lg px-9 py-4 rounded-2xl gap-3",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
