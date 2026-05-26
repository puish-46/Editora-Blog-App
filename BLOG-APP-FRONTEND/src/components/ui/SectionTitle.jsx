import React from "react";

export const SectionTitle = ({ 
  title, 
  subtitle, 
  category, 
  align = "left", 
  className = "", 
  children,
  ...props 
}) => {
  const alignmentStyles = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div className={`flex flex-col gap-2 mb-10 w-full ${alignmentStyles[align]} ${className}`} {...props}>
      {category && (
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
          {category}
        </span>
      )}
      
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between w-full gap-4">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-text-light-primary dark:text-text-dark-primary">
          {title}
        </h2>
        {children && <div className="flex items-center gap-3">{children}</div>}
      </div>

      {subtitle && (
        <p className="text-sm sm:text-base text-text-light-secondary/80 dark:text-text-dark-secondary/80 max-w-2xl mt-1 leading-relaxed">
          {subtitle}
        </p>
      )}
      
      <div className="w-full border-t border-border-light dark:border-border-dark mt-4"></div>
    </div>
  );
};

export default SectionTitle;
