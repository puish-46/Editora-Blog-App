import React from "react";

export const Input = React.forwardRef(({
  label,
  type = "text",
  placeholder = "",
  error,
  className = "",
  wrapperClassName = "",
  rows = 4,
  options = [], // for select element
  children, 
  ...props
}, ref) => {
  const baseInputStyle = "w-full bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 text-text-light-primary dark:text-text-dark-primary text-sm placeholder:text-text-light-secondary/40 dark:placeholder:text-text-dark-secondary/40 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/15 transition-all duration-300";
  const errorInputStyle = "border-red-500/50 dark:border-red-500/50 focus:ring-red-500/10 focus:border-red-500";

  return (
    <div className={`mb-5 ${wrapperClassName}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-text-light-secondary/80 dark:text-text-dark-secondary/80 mb-2 block">
          {label}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          className={`${baseInputStyle} ${error ? errorInputStyle : ""} ${className}`}
          {...props}
        />
      ) : type === "select" ? (
        <select
          ref={ref}
          className={`${baseInputStyle} ${error ? errorInputStyle : ""} ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
      ) : (
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`${baseInputStyle} ${error ? errorInputStyle : ""} ${className}`}
          {...props}
        />
      )}

      {error && (
        <p className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl px-4 py-2.5 text-xs font-medium mt-2 animate-pulse">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
