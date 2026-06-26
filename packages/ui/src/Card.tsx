import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "elevated" | "glass";
}

const paddingClasses = {
  sm: "p-5",
  md: "p-6",
  lg: "p-8",
};

const variantClasses = {
  default: "bg-white border-foam shadow-sm",
  elevated: "bg-white border-transparent shadow-lg shadow-ocean/8",
  glass: "bg-white/70 border-white/60 backdrop-blur-md shadow-sm",
};

export function Card({
  padding = "md",
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl border",
        paddingClasses[padding],
        variantClasses[variant],
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={["mb-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={["text-lg font-semibold text-charcoal tracking-tight", className].join(" ")}
      {...props}
    >
      {children}
    </h3>
  );
}
