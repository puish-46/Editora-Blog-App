import React from "react";

export const Loader = ({ message = "Loading content...", size = "md", className = "", ...props }) => {
  const sizeStyles = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`} {...props}>
      <div className="relative">
        {/* Outer subtle ring */}
        <div className={`rounded-full border-accent/10 ${sizeStyles[size]}`}></div>
        {/* Animated spinner */}
        <div className={`absolute top-0 left-0 rounded-full border-t-accent border-r-transparent border-b-transparent border-l-transparent animate-spin ${sizeStyles[size]}`}></div>
      </div>
      {message && (
        <p className="mt-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-text-light-secondary/60 dark:text-text-dark-secondary/60 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
