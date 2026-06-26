import { MarketingLayout, PageCta } from "@/components/MarketingLayout";
import { Card } from "@humboldt/ui";
import { DEFAULT_ROUTE_SCHEDULE } from "@humboldt/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "How North Coast Laundry works — book online or call, we pick up, wash at a local laundromat, and deliver clean laundry in Humboldt County.",
};

const STEPS = [
  {
    step: "01",
    title: "Book online or call us",
    desc: "Pick your service — full wash & fold, dry only, or dry + fold if you hand-washed. Choose a day that works, or ask about our route schedule.",
  },
  {
    step: "02",
    title: "We pick up & care for it",
    desc: "We come to your door in Arcata, Eureka, Loleta, or Fields Landing. Your laundry is washed at a local laundromat and folded to your notes.",
  },
  {
    step: "03",
    title: "Delivered clean",
    desc: "Most orders return within 48 hours. Track status online, or we'll reach out by phone — especially helpful for senior customers.",
  },
];

export default function HowItWorksPage() {
  return (
    <MarketingLayout
      title="How it works"
      subtitle="Owner-operated and local — you're dealing directly with the people washing your clothes."
    >
      <div className="space-y-6">
        {STEPS.map((item) => (
          <Card key={item.step} padding="md">
            <p className="text-sm font-bold text-ocean-light">{item.step}</p>
            <h2 className="mt-2 text-xl font-semibold text-charcoal">{item.title}</h2>
            <p className="mt-3 text-slate leading-relaxed">{item.desc}</p>
          </Card>
        ))}
      </div>

      <Card padding="md" className="mt-8">
        <h2 className="font-semibold text-charcoal">Default pickup routes</h2>
        <p className="mt-2 text-sm text-slate leading-relaxed">
          These days are our starting point. As more neighbors book, we add windows where demand is highest —
          tell us what works on our{" "}
          <a href="/community" className="text-ocean font-medium hover:underline">
            community page
          </a>
          .
        </p>
        <ul className="mt-4 space-y-2 text-slate">
          {DEFAULT_ROUTE_SCHEDULE.map((r) => (
            <li key={r.day}>
              <strong className="text-charcoal">{r.day}</strong> — {r.area}
            </li>
          ))}
        </ul>
      </Card>

      <PageCta />
    </MarketingLayout>
  );
}
