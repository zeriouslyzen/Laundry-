import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={textareaId} className="text-sm font-semibold text-charcoal">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          className={[
            "w-full rounded-xl border bg-white px-4 py-3 text-charcoal min-h-[110px]",
            "placeholder:text-slate/60",
            "focus:outline focus:outline-2 focus:outline-offset-0 focus:outline-ocean/40 focus:border-ocean-light",
            "transition-colors resize-y",
            error ? "border-[#C45C5C]" : "border-foam",
            className,
          ].join(" ")}
          {...props}
        />
        {error ? <p className="text-sm text-[#C45C5C]">{error}</p> : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
