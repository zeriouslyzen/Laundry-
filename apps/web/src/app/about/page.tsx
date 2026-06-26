import { MarketingLayout, PageCta } from "@/components/MarketingLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About North Coast Laundry — owner-operated laundry pickup and delivery serving Arcata, Eureka, Loleta & Fields Landing in Humboldt County.",
};

const VALUES = [
  {
    title: "Owner-operated & local",
    desc: "Run by a small Humboldt team — not a call center or gig app. You know who has your clothes.",
  },
  {
    title: "Clear per-load pricing",
    desc: "Full service with transparent list pricing. Seniors, veterans, and student groups receive discounts.",
  },
  {
    title: "Built for real life",
    desc: "Students avoiding campus machines, seniors who shouldn't haul hampers, and anyone down a long driveway from town.",
  },
  {
    title: "Phone-friendly",
    desc: "Prefer to book by phone? Call us — we'll schedule your pickup and confirm your window.",
  },
];

export default function AboutPage() {
  return (
    <MarketingLayout
      title="About North Coast Laundry"
      subtitle="Professional laundry pickup and delivery — now serving Arcata, Eureka, Loleta & Fields Landing."
    >
      <p className="text-slate leading-relaxed text-lg">
        North Coast Laundry is a local pickup, wash, fold, and delivery service for Humboldt County.
        We started because laundry shouldn&apos;t eat your afternoon — and because plenty of neighbors
        are too far from a laundromat or can&apos;t easily do it themselves.
      </p>

      <div className="mt-10 space-y-8">
        {VALUES.map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ocean" />
            <div>
              <h2 className="font-semibold text-charcoal text-lg">{item.title}</h2>
              <p className="mt-2 text-slate leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="font-semibold text-charcoal text-lg">Service area</h2>
        <p className="mt-3 text-slate leading-relaxed">
          Arcata, Eureka, Loleta, and Fields Landing. Loleta area includes a small distance fee.
          Pickup days flex as more neighbors book — share ideas on our community page.
        </p>
      </div>

      <PageCta />
    </MarketingLayout>
  );
}
