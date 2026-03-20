import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "outline" | "destructive";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const baseStyles = `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium cursor-pointer select-none
  transition-colors focus-visible:outline focus-visible:outline-2
  focus-visible:outline-offset-2 focus-visible:outline-accent
  disabled:cursor-not-allowed disabled:opacity-50"`;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-text hover:bg-accent-hover",
  outline: "border border-line bg-surface text-ink hover:bg-canvas",
  destructive: "bg-error-surface text-error hover:opacity-90", // uses the existing, previously-unused error tokens
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      />
    );
  },
);

// However, when you wrap a component in a Higher-Order Component, a forwardRef, or a memo,
// React loses track of that function name. Instead of showing a clean name,
// React DevTools will display something anonymous or generic
// By explicitly assigning a .displayName, you force the tools to show the exact string name you provided, making debugging much easier
Button.displayName = "Button";
