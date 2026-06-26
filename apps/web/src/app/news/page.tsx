import Link from "next/link";
import { MarketingLayout, PageCta } from "@/components/MarketingLayout";
import { Card } from "@humboldt/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "News",
  description:
    "Updates from North Coast Laundry — service area, pricing, routes, and community news for Arcata, Eureka, and Humboldt County.",
};

const POSTS = [
  {
    slug: "now-serving-humboldt",
    date: "2025-06-26",
    title: "Now serving Arcata, Eureka, Loleta & Fields Landing",
    excerpt:
      "North Coast Laundry is live. Book pickup online or call us — owner-operated, local team, transparent per-load pricing.",
    body: [
      "We're officially open for pickup, wash, fold, and delivery across our launch area: Arcata, Eureka, Loleta, and Fields Landing.",
      "Routes run Tuesday (Arcata), Wednesday (Eureka), and Friday (Loleta area). Days may shift as more neighbors book — tell us what works on our community page.",
      "Seniors and veterans receive 5% off. Students booking together (2+) save 5–10%.",
    ],
  },
  {
    slug: "flexible-routes",
    date: "2025-06-20",
    title: "Pickup days adjust to what you need",
    excerpt:
      "Our default route schedule is a starting point. As bookings grow, we'll add windows where demand is highest.",
    body: [
      "We started with three route days to keep costs predictable. If your block or building wants a different day, let us know — we batch pickups by area to stay efficient.",
      "Use the community suggestions page or call to request a pickup window.",
    ],
  },
  {
    slug: "pricing-discounts",
    date: "2025-06-15",
    title: "Discounts for seniors, veterans & student groups",
    excerpt:
      "Full service from $27/load. Seniors and veterans save 5%. Roommates and student groups booking together save 5–10%.",
    body: [
      "Our list prices include standard operating costs for Humboldt laundromats and travel. Seniors and veterans receive 5% off at checkout.",
      "Students booking as a group of 2–3 save 5%; groups of 4+ save 10%. Recurring weekly pickups save an additional 10%.",
    ],
  },
];

export default function NewsPage() {
  return (
    <MarketingLayout
      title="News & updates"
      subtitle="What's new at North Coast Laundry — routes, pricing, and community."
    >
      <div className="space-y-8">
        {POSTS.map((post) => (
          <Card key={post.slug} padding="md" id={post.slug}>
            <time className="text-sm text-ocean font-medium">
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <h2 className="mt-2 text-xl font-semibold text-charcoal">{post.title}</h2>
            <p className="mt-3 text-slate leading-relaxed">{post.excerpt}</p>
            <div className="mt-4 space-y-3 text-sm text-slate leading-relaxed">
              {post.body.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-10 text-sm text-slate">
        Have a story or partnership idea?{" "}
        <Link href="/contact" className="text-ocean font-medium hover:underline">
          Contact us
        </Link>{" "}
        or{" "}
        <Link href="/community" className="text-ocean font-medium hover:underline">
          share a suggestion
        </Link>
        .
      </p>

      <PageCta />
    </MarketingLayout>
  );
}
