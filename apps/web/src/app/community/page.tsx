import { MarketingLayout, PageCta } from "@/components/MarketingLayout";
import { CommunitySuggestionsForm } from "@/components/CommunitySuggestionsForm";
import { Card } from "@humboldt/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Suggestions",
  description:
    "Share ideas for North Coast Laundry — pickup routes, services, and neighborhoods. Help shape our Humboldt County laundry service.",
};

export default function CommunityPage() {
  return (
    <MarketingLayout
      title="Community suggestions"
      subtitle="We're a local team — your input shapes our routes, services, and schedule."
    >
      <p className="text-slate leading-relaxed text-lg">
        Pickup days and routes adjust based on what neighbors need. Tell us where you are,
        what days work, or what would make laundry easier for you.
      </p>

      <div className="mt-8 max-w-lg">
        <CommunitySuggestionsForm />
      </div>

      <Card padding="md" className="mt-8">
        <h2 className="font-semibold text-charcoal">Ideas we love hearing</h2>
        <ul className="mt-4 space-y-2 text-slate text-sm leading-relaxed">
          <li>Preferred pickup day for your neighborhood</li>
          <li>Senior or veteran programs we should offer</li>
          <li>Student housing or roommate group bookings</li>
          <li>Hand-wash, dry-only, or specialty care needs</li>
          <li>Areas beyond Arcata, Eureka, Loleta &amp; Fields Landing</li>
        </ul>
      </Card>

      <PageCta />
    </MarketingLayout>
  );
}
