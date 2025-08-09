// src/components/ThemeToggle.tsx

"use client";
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Ensure component is mounted to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="inline-flex h-9 w-9 items-center justify-center rounded-lg">
        <div className="h-[1.2rem] w-[1.2rem]" />
      </button>
    );
  }

  const isDark = theme === "dark";

  const handleToggle = () => {
    setIsAnimating(true);
    setTheme(theme === "light" ? "dark" : "light");
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      className={`
        relative inline-flex h-9 w-9 items-center justify-center rounded-lg 
        transition-all duration-200 ease-out
        hover:bg-accent/50 hover:scale-110 hover:shadow-md
        active:scale-95 active:bg-accent/70
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
        group overflow-hidden
        ${isAnimating ? 'animate-pulse' : ''}
      `}
      onClick={handleToggle}
      title="Toggle theme"
    >
      {/* Animated background circle */}
      <div className={`
        absolute inset-0 rounded-lg transition-all duration-500 ease-out
        ${isAnimating ? 'bg-gradient-to-r from-amber-200/30 to-blue-200/30 scale-150' : 'scale-100'}
      `} />

      {/* Rotating background for extra flair */}
      <div className={`
        absolute inset-0 rounded-lg transition-all duration-700 ease-out
        bg-gradient-to-tr from-transparent via-accent/10 to-transparent
        ${isAnimating ? 'rotate-180 scale-125' : 'rotate-0 scale-100'}
      `} />
      
      {/* Sun Icon: Visible in light mode, rotates out in dark mode */}
      <Sun 
        className={`
          h-[1.2rem] w-[1.2rem] z-10 relative
          transform-gpu transition-all duration-500 ease-out
          group-hover:text-amber-500 group-hover:drop-shadow-sm
          ${isDark 
            ? '-rotate-180 scale-0 opacity-0' 
            : 'rotate-0 scale-100 opacity-100'
          }
          ${isAnimating ? 'animate-spin' : ''}
        `} 
      />
      
      {/* Moon Icon: Hidden in light mode, rotates in for dark mode */}
      <Moon 
        className={`
          absolute h-[1.2rem] w-[1.2rem] z-10
          transform-gpu transition-all duration-500 ease-out
          group-hover:text-blue-400 group-hover:drop-shadow-sm
          ${isDark 
            ? 'rotate-0 scale-100 opacity-100' 
            : 'rotate-180 scale-0 opacity-0'
          }
          ${isAnimating ? 'animate-bounce' : ''}
        `} 
      />

      {/* Sparkle effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-1 right-1 h-1 w-1 bg-current rounded-full animate-ping" />
        <div className="absolute bottom-1 left-1 h-1 w-1 bg-current rounded-full animate-ping animation-delay-150" />
      </div>
      
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}