// src/components/ThemeToggle.tsx
"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      className="
        relative p-2 rounded-lg transition-all duration-200 ease-out
        hover:bg-accent/50 hover:scale-105 
        active:scale-95 active:bg-accent/70
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        group
      "
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Toggle theme"
    >
      {/* Sun Icon */}
      <Sun className="
        h-[1.1rem] w-[1.1rem] 
        transition-all duration-300 ease-out
        rotate-0 scale-100 opacity-100
        dark:-rotate-180 dark:scale-0 dark:opacity-0
        group-hover:text-amber-500
      " />
      
      {/* Moon Icon */}
      <Moon className="
        absolute top-2 left-2 h-[1.1rem] w-[1.1rem]
        transition-all duration-300 ease-out
        rotate-180 scale-0 opacity-0
        dark:rotate-0 dark:scale-100 dark:opacity-100
        group-hover:text-blue-400
      " />
      
      <span className="sr-only">Toggle between light and dark mode</span>
    </button>
  );
}