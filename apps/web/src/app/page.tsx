import { ButtonLink, Card } from "@humboldt/ui";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { CommunitySuggestionsForm } from "@/components/CommunitySuggestionsForm";
import { HeroVideoBackground } from "@/components/HeroVideoBackground";
import {
  DEFAULT_ROUTE_SCHEDULE,
  getListPricing,
  formatCents,
} from "@humboldt/db";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import type { Metadata } from "next";

const list = getListPricing();

export const metadata: Metadata = {
  title: "Laundry Pickup & Delivery | Humboldt County",
  description:
    "Now serving Arcata, Eureka, Loleta & Fields Landing. Owner-operated wash, fold & delivery from " +
    formatCents(list.fullService) +
    "/load. Seniors & veterans save 5%. Book online or call.",
};

const STEPS = [
  {
    step: "01",
    title: "Schedule your pickup",
    desc: "Choose a date, time window, and any add-ons. Takes less than two minutes — or call us.",
  },
  {
    step: "02",
    title: "We wash & fold",
    desc: "Our local team picks up your laundry, washes it at a partner laundromat, and folds it to your notes.",
  },
  {
    step: "03",
    title: "Delivered clean",
    desc: "Fresh laundry returned to your door — or ready for pickup on your schedule.",
  },
];

const PRICING = [
  { label: "Full service", price: formatCents(list.fullService), note: "Per load · wash, dry, fold & delivery" },
  { label: "Dry only", price: formatCents(list.dryOnly), note: "You hand-washed · we dry & return" },
  { label: "Dry + fold", price: formatCents(list.dryAndFold), note: "Hand-wash customers" },
  { label: "Senior / veteran", price: "5% off", note: "At checkout — thank you for your service" },
];

const TRUST = [
  {
    title: "Owner-operated & local",
    desc: "A small Humboldt team — not a gig app. You know who has your clothes from pickup to delivery.",
  },
  {
    title: "Clear pricing",
    desc: "No hidden fees. You see the full cost before you confirm your order.",
  },
  {
    title: "Phone or online",
    desc: "Book on the web or call us — especially helpful for seniors and first-time customers.",
  },
  {
    title: "Flexible routes",
    desc: "Default pickup days adjust as neighbors book. Tell us what day works for your area.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  description:
    "Owner-operated laundry pickup, wash, fold, and delivery in Humboldt County.",
  url: SITE_URL,
  telephone: "+17075550100",
  areaServed: ["Arcata", "Eureka", "Loleta", "Fields Landing"],
  priceRange: "$$",
  serviceType: ["Laundry pickup", "Wash and fold", "Laundry delivery"],
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero — full-bleed video, mobile-first */}
        <section className="relative isolate min-h-[88svh] overflow-hidden border-b border-foam">
          <HeroVideoBackground />
          <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-4 pb-10 pt-24 sm:justify-center sm:pb-16 sm:pt-28 md:px-6">
            <div className="grid w-full gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
              <div className="max-w-xl rounded-2xl bg-charcoal/25 p-5 backdrop-blur-[2px] sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky sm:text-sm">
                  Now serving Humboldt County
                </p>
                <h1 className="hero-text-shadow mt-3 font-display text-[1.75rem] font-semibold leading-[1.15] tracking-tight text-white sm:mt-4 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
                  Professional laundry care, delivered.
                </h1>
                <p className="hero-text-shadow mt-4 text-base leading-relaxed text-white/90 sm:mt-6 sm:text-lg">
                  North Coast Laundry picks up your clothes, washes and folds them with care,
                  and returns them clean — from {formatCents(list.fullService)}/load in Arcata &amp; Eureka.
                </p>
                <div className="mt-8 flex w-full flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4">
                  <ButtonLink href="/book/new" size="lg" className="w-full sm:w-auto shadow-lg shadow-charcoal/30">
                    Schedule pickup
                  </ButtonLink>
                  <ButtonLink
                    href="/how-it-works"
                    size="lg"
                    variant="inverse"
                    className="w-full sm:w-auto"
                  >
                    See how it works
                  </ButtonLink>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {[
                  { stat: "48hr", label: "Typical turnaround" },
                  { stat: formatCents(list.fullService), label: "Full service / load" },
                  { stat: "4", label: "Cities served" },
                  { stat: formatCents(list.minimum), label: "Order minimum" },
                ].map((item) => (
                  <Card
                    key={item.label}
                    variant="elevated"
                    padding="sm"
                    className="border-white/20 bg-white/95 text-center shadow-lg shadow-charcoal/20 backdrop-blur-md"
                  >
                    <p className="text-xl font-semibold text-ocean sm:text-2xl">{item.stat}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate sm:text-xs">{item.label}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-4 py-24 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-ocean">How it works</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-charcoal">
                Simple from start to finish
              </h2>
              <p className="mt-4 text-slate text-lg">
                Book online in minutes. We handle pickup, washing, and return.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {STEPS.map((item) => (
                <Card key={item.step} variant="default" className="border-foam">
                  <p className="text-sm font-bold text-ocean-light">{item.step}</p>
                  <h3 className="mt-3 text-lg font-semibold text-charcoal">{item.title}</h3>
                  <p className="mt-3 text-slate leading-relaxed text-sm">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section id="trust" className="px-4 py-24 bg-mist/40 border-y border-foam">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-ocean">Why North Coast Laundry</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-charcoal">
                A service you can trust with your clothes
              </h2>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2">
              {TRUST.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-ocean" />
                  <div>
                    <h3 className="font-semibold text-charcoal">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-4 py-24 bg-white">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-sm font-semibold uppercase tracking-widest text-ocean">Pricing</p>
              <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-charcoal">
                Per-load pricing that covers real costs
              </h2>
              <p className="mt-4 text-slate">
                Student groups (2+) save 5–10%. Seniors &amp; veterans save 5%.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {PRICING.map((item) => (
                <Card key={item.label} padding="sm" className="text-center border-foam">
                  <p className="text-sm font-medium text-slate">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-ocean">{item.price}</p>
                  <p className="text-xs text-slate mt-1">{item.note}</p>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <ButtonLink href="/pricing" variant="outline" size="sm">
                View full pricing
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Routes */}
        <section className="px-4 py-16 bg-mist/30 border-y border-foam">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="font-display text-2xl font-semibold text-charcoal">Default pickup routes</h2>
            <p className="mt-3 text-slate max-w-xl mx-auto">
              Days shift based on bookings — request a different window anytime.
            </p>
            <ul className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              {DEFAULT_ROUTE_SCHEDULE.map((r) => (
                <li key={r.day} className="rounded-full bg-white border border-foam px-4 py-2">
                  <strong className="text-charcoal">{r.day}</strong>
                  <span className="text-slate"> — {r.area}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="px-4 py-24 bg-ocean-dark">
          <div className="mx-auto max-w-3xl text-center text-white">
            <p className="text-sky/80 text-sm font-semibold uppercase tracking-widest">Questions?</p>
            <h2 className="mt-4 font-display text-3xl md:text-4xl font-semibold">
              Call or book online
            </h2>
            <p className="mt-5 text-lg text-white/80 leading-relaxed">
              Prefer talking to a person? We&apos;re happy to schedule your pickup over the phone —
              especially for seniors and first-time customers.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="tel:+17075550100"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-lg font-semibold text-ocean-dark hover:bg-mist transition-colors"
              >
                (707) 555-0100
              </a>
              <ButtonLink href="/book/new" size="lg" variant="inverse">
                Book online
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="px-4 py-24 bg-fog">
          <div className="mx-auto max-w-lg">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-charcoal">
                Help shape our service
              </h2>
              <p className="mt-3 text-slate leading-relaxed">
                Suggest pickup days, neighborhoods, or services — we read every message.
              </p>
            </div>
            <CommunitySuggestionsForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
