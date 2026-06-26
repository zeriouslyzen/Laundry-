import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ocean text-white hover:bg-ocean-dark border-transparent shadow-md shadow-ocean/20 hover:shadow-lg hover:shadow-ocean/25",
  secondary:
    "bg-ocean-light text-white hover:bg-ocean border-transparent",
  soft:
    "bg-mist text-ocean hover:bg-foam border-transparent",
  outline:
    "bg-white/80 text-charcoal border-foam hover:bg-mist hover:border-ocean-light/40 backdrop-blur-sm",
  ghost: "bg-transparent text-slate border-transparent hover:bg-mist/80",
  danger: "bg-[#C45C5C] text-white hover:bg-[#a84a4a] border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2.5 text-sm min-h-[40px] rounded-lg",
  md: "px-6 py-3 text-base min-h-[48px] rounded-xl",
  lg: "px-8 py-3.5 text-lg min-h-[56px] rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      loading,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 border font-semibold leading-normal tracking-normal transition-all duration-200 whitespace-nowrap",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean",
        "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
);
Button.displayName = "Button";
