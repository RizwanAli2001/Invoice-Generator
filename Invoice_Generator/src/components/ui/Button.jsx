import React from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const Button = ({
  children,
  variant = "primary",
  loading,
  className = "",
  type = "button",
  ...props
}) => (
  <button
    type={type}
    className={`${variants[variant] || variants.primary} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
);

export default Button;
