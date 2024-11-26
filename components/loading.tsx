import React from "react";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

export default function Loading({
  size = "medium",
  text = "Loading...",
  className = "",
}: LoadingProps) {
  const sizeClasses = {
    small: "w-12 h-12",
    medium: "w-16 h-16",
    large: "w-20 h-20",
  };

  const textSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div className={`flex items-center justify-center flex-col ${className}`}>
      <div className="relative flex flex-col items-center">
        {/* Spinner */}
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Outer circle */}
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          {/* Spinning circle */}
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>

        {/* Loading text */}
        <div className={`mt-4 flex flex-col items-center gap-2`}>
          <div className={`font-semibold text-white ${textSizeClasses[size]}`}>
            {text}
          </div>
          {/* Bouncing dots */}
          <div className="flex justify-center space-x-1">
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Full page loading component
export function LoadingPage() {
  return (
    <div className="h-full w-full flex items-center justify-center min-h-[400px]">
      <Loading size="large" />
    </div>
  );
}

// Overlay loading component
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Loading size="medium" />
      </div>
    </div>
  );
}

// Inline loading component
export function LoadingInline() {
  return <Loading size="small" className="py-2" />;
}
