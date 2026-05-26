import React from "react";

export const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  className = "", 
  loading = false, 
  disabled = false, 
  type = "button",
  ...props 
}, ref) => {
  const baseStyle = "relative font-semibold inline-flex items-center justify-center rounded-full transition-editorial active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 text-sm tracking-tight select-none";
  
  const variants = {
    primary: "bg-accent hover:bg-accent-hover text-white dark:text-paper-dark px-6 py-2.5 shadow-sm hover:shadow-editorial-hover",
    secondary: "border border-border-light dark:border-border-dark text-text-light-primary dark:text-text-dark-primary px-6 py-2.5 hover:bg-card-light dark:hover:bg-card-dark",
    outline: "border border-accent text-accent px-6 py-2.5 hover:bg-accent hover:text-white dark:hover:text-paper-dark",
    ghost: "text-accent hover:text-accent-hover px-4 py-2 hover:bg-accent/5",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 px-6 py-2.5 hover:bg-red-500 hover:text-white"
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Please wait...
        </span>
      ) : children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
