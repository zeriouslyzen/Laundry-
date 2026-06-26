import { type InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
}

export function Checkbox({ label, description, className = "", id, ...props }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label
      htmlFor={checkboxId}
      className={["flex items-start gap-3 cursor-pointer group", className].join(" ")}
    >
      <input
        type="checkbox"
        id={checkboxId}
        className="mt-1 h-4 w-4 rounded border-foam text-ocean focus:ring-ocean/30"
        {...props}
      />
      <div>
        <span className="text-sm font-medium text-charcoal group-hover:text-ocean transition-colors">
          {label}
        </span>
        {description ? (
          <p className="text-sm text-slate mt-0.5">{description}</p>
        ) : null}
      </div>
    </label>
  );
}
