import { type SelectHTMLAttributes, forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={selectId} className="text-sm font-semibold text-charcoal">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 text-charcoal",
            "focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-ocean/40 focus:border-ocean-light",
            "transition-colors",
            error ? "border-[#C45C5C]" : "border-foam",
            className,
          ].join(" ")}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-sm text-[#C45C5C]">{error}</p> : null}
      </div>
    );
  }
);
Select.displayName = "Select";
