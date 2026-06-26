import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "soft" | "inverse";
type Size = "sm" | "md" | "lg";

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ocean text-white hover:bg-ocean-dark border-transparent shadow-md shadow-ocean/20",
  secondary: "bg-ocean-light text-white hover:bg-ocean border-transparent",
  soft: "bg-mist text-ocean hover:bg-foam border-transparent",
  outline:
    "bg-white text-charcoal border-foam hover:bg-mist hover:border-ocean-light/40",
  inverse:
    "bg-transparent text-white border-white hover:bg-white/10 hover:text-white",
  ghost: "bg-transparent text-slate border-transparent hover:bg-mist/80",
  danger: "bg-[#C45C5C] text-white hover:bg-[#a84a4a] border-transparent",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2.5 text-sm min-h-[40px] rounded-lg",
  md: "px-6 py-3 text-base min-h-[48px] rounded-xl",
  lg: "px-8 py-3.5 text-lg min-h-[56px] rounded-xl",
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={[
        "inline-flex items-center justify-center gap-2 border font-semibold leading-normal tracking-normal transition-all duration-200 whitespace-nowrap",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ocean",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}
