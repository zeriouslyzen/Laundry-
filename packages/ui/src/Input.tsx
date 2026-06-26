import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-semibold text-charcoal">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 text-charcoal",
            "placeholder:text-slate/60",
            "focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-ocean/40 focus:border-ocean-light",
            "transition-colors",
            error ? "border-[#C45C5C]" : "border-foam",
            className,
          ].join(" ")}
          {...props}
        />
        {error ? <p className="text-sm text-[#C45C5C]">{error}</p> : null}
        {hint && !error ? <p className="text-sm text-slate">{hint}</p> : null}
      </div>
    );
  }
);
Input.displayName = "Input";
