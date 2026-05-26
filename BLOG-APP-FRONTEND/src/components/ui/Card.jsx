import React from "react";

export const Card = ({ children, className = "", hoverEffect = true, ...props }) => {
  return (
    <div
      className={`bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl p-7 transition-all duration-300 ${
        hoverEffect ? "hover:border-accent/40 hover:shadow-editorial-hover hover:scale-[1.01]" : "shadow-editorial"
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
