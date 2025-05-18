import React from "react";

function Button({ children, className, variant = "default", ...props }) {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variantStyles = {
    default: "bg-teal-600 text-white hover:bg-teal-700",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
  };
  
  const combinedClassName = `${baseStyles} ${variantStyles[variant] || ""} ${className || ""}`;
  
  return (
    <button className={combinedClassName} {...props}>
      {children}
    </button>
  );
}

export default Button; 