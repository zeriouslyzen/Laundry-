import Link from "next/link";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: "h-9 w-9 text-[10px]", name: "text-sm", tag: "hidden" },
    md: { icon: "h-10 w-10 text-[11px]", name: "text-base", tag: "hidden sm:block" },
    lg: { icon: "h-11 w-11 text-xs", name: "text-xl", tag: "block" },
  };
  const s = sizes[size];

  return (
    <Link href="/" className="flex items-center gap-3.5 group shrink-0">
      <span
        className={[
          "flex items-center justify-center rounded-lg bg-ocean font-bold text-white tracking-tight shadow-sm",
          s.icon,
        ].join(" ")}
      >
        NCL
      </span>
      <div className="flex flex-col gap-0.5 leading-snug">
        <span className={["font-semibold text-charcoal tracking-tight", s.name].join(" ")}>
          North Coast Laundry
        </span>
        <span className={["text-[11px] text-slate leading-none", s.tag].join(" ")}>
          Humboldt County
        </span>
      </div>
    </Link>
  );
}
