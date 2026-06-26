import { MarketingLayout, PageCta } from "@/components/MarketingLayout";
import { Card } from "@humboldt/ui";
import {
  getListPricing,
  formatCents,
  toListPriceCents,
  LAUNCH_PRICING,
} from "@humboldt/db";
import type { Metadata } from "next";

const list = getListPricing();

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "North Coast Laundry pricing — full service from " +
    formatCents(list.fullService) +
    "/load. Seniors & veterans 5% off. Student groups 5–10% off. Arcata, Eureka, Loleta & Fields Landing.",
};

const CORE = [
  { service: "Full service", price: formatCents(list.fullService) + " / load", desc: "Pickup, wash, dry, fold & delivery" },
  { service: "Wash + dry only", price: formatCents(list.washDryOnly) + " / load", desc: "No fold — basket or hang return" },
  { service: "Dry only", price: formatCents(list.dryOnly) + " / load", desc: "You hand-washed — we dry & return" },
  { service: "Dry + fold", price: formatCents(list.dryAndFold) + " / load", desc: "You hand-washed — we dry, fold & return" },
];

export default function PricingPage() {
  const zoneFee = formatCents(toListPriceCents(LAUNCH_PRICING.extendedZoneSurchargeCents));

  return (
    <MarketingLayout
      title="Pricing"
      subtitle="Per-load pricing built around real Humboldt laundromat costs. No hidden pickup tricks."
    >
      <Card padding="md" className="mb-8 bg-mist/50 border-foam">
        <p className="text-sm text-slate leading-relaxed">
          <strong className="text-charcoal">Service area:</strong> Arcata, Eureka, Loleta &amp; Fields Landing.
          Loleta area (includes Fields Landing) adds <strong>{zoneFee}</strong> per order.
          Pick up yourself when ready and save <strong>$4</strong>.
        </p>
      </Card>

      <h2 className="font-semibold text-charcoal text-lg mb-4">Arcata & Eureka</h2>
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {CORE.map((item) => (
          <Card key={item.service} padding="sm">
            <p className="font-medium text-charcoal">{item.service}</p>
            <p className="mt-1 text-2xl font-semibold text-ocean">{item.price}</p>
            <p className="mt-2 text-sm text-slate">{item.desc}</p>
          </Card>
        ))}
      </div>

      <h2 className="font-semibold text-charcoal text-lg mb-4">Discounts</h2>
      <ul className="space-y-2 text-slate text-sm mb-10">
        <li><strong>Seniors &amp; veterans</strong> — 5% off at checkout</li>
        <li><strong>Student groups (2–3)</strong> — 5% off when booking together</li>
        <li><strong>Student groups (4+)</strong> — 10% off when booking together</li>
        <li><strong>Recurring weekly</strong> — additional 10% off</li>
      </ul>

      <h2 className="font-semibold text-charcoal text-lg mb-4">Add-ons</h2>
      <ul className="space-y-2 text-slate text-sm mb-10">
        <li>Soap provided — +{formatCents(toListPriceCents(LAUNCH_PRICING.soapAddonCents))}</li>
        <li>Dryer sheets — +{formatCents(toListPriceCents(LAUNCH_PRICING.dryerSheetsAddonCents))}</li>
        <li>Same-day rush — +{formatCents(toListPriceCents(LAUNCH_PRICING.rushAddonCents))} (when available)</li>
        <li>You pick up clean laundry — −$4</li>
      </ul>

      <Card padding="md" className="bg-mist/30">
        <h2 className="font-semibold text-charcoal">Example orders</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate">
          <li>Student in Arcata, 1 load full service — <strong className="text-ocean">{formatCents(list.fullService)}</strong></li>
          <li>Senior in Eureka, 1 load full service (5% off) — <strong className="text-ocean">{formatCents(Math.round(list.fullService * 0.95))}</strong></li>
          <li>Hand-wash in Loleta, dry + fold — <strong className="text-ocean">{formatCents(list.dryAndFold + toListPriceCents(LAUNCH_PRICING.extendedZoneSurchargeCents))}</strong></li>
        </ul>
        <p className="mt-4 text-xs text-slate">
          {formatCents(list.minimum)} order minimum. Recurring weekly pickups: <strong>10% off</strong>.
        </p>
      </Card>

      <PageCta />
    </MarketingLayout>
  );
}
