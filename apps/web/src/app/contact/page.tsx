import { MarketingLayout, PageCta } from "@/components/MarketingLayout";
import { Card, ButtonLink } from "@humboldt/ui";
import { DEFAULT_ROUTE_SCHEDULE } from "@humboldt/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact North Coast Laundry — phone bookings, customer support, and service area info for Arcata, Eureka, Loleta & Fields Landing.",
};

export default function ContactPage() {
  return (
    <MarketingLayout
      title="Contact us"
      subtitle="Questions, phone bookings, or help scheduling — we're easy to reach."
    >
      <Card padding="md" className="mb-6 border-ocean/20 bg-mist/30">
        <h2 className="font-semibold text-charcoal text-lg">Prefer the phone?</h2>
        <p className="mt-2 text-slate leading-relaxed">
          Seniors and first-time customers often prefer to call. We&apos;ll walk you through service options and pickup windows.
        </p>
        <a
          href="tel:+17075550100"
          className="mt-4 inline-block text-2xl font-semibold text-ocean hover:text-ocean-dark"
        >
          (707) 555-0100
        </a>
        <p className="mt-2 text-xs text-slate">Replace with your real number before launch</p>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card padding="md">
          <h2 className="font-semibold text-charcoal">Customer support</h2>
          <p className="mt-3 text-slate text-sm leading-relaxed">
            Order questions, scheduling, or service issues.
          </p>
          <p className="mt-4 text-ocean font-medium">care@northcoastlaundry.com</p>
        </Card>

        <Card padding="md">
          <h2 className="font-semibold text-charcoal">Online booking</h2>
          <p className="mt-3 text-slate text-sm leading-relaxed">
            Fastest for students and repeat customers.
          </p>
          <div className="mt-4">
            <ButtonLink href="/book/new" size="sm">
              Book a pickup
            </ButtonLink>
          </div>
        </Card>
      </div>

      <Card padding="md" className="mt-6">
        <h2 className="font-semibold text-charcoal">Service area</h2>
        <p className="mt-3 text-slate leading-relaxed">
          Arcata, Eureka, Loleta, and Fields Landing.
        </p>
        <p className="mt-2 text-sm text-slate">
          <strong>Default routes:</strong>{" "}
          {DEFAULT_ROUTE_SCHEDULE.map((r) => `${r.day} ${r.area}`).join(" · ")} — flexible with demand
        </p>
      </Card>

      <PageCta />
    </MarketingLayout>
  );
}
