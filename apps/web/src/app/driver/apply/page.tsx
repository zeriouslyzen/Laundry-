import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { ButtonLink } from "@humboldt/ui";

export default function DriverApplyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <SiteHeader />
      <main className="flex-1 px-4 py-20">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-ocean">Driver partners</p>
            <h1 className="mt-4 font-display text-3xl md:text-4xl font-semibold text-charcoal">
              Drive with North Coast Laundry
            </h1>
            <p className="mt-4 text-lg text-slate leading-relaxed max-w-lg mx-auto">
              Join our network of local drivers. Flexible hours, transparent pay,
              and a straightforward onboarding process.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { title: "Flexible schedule", desc: "Set your availability and accept orders that fit your day." },
              { title: "Competitive pay", desc: "Earn approximately 75% of each completed order." },
              { title: "Your setup", desc: "Wash at home or at a partner laundromat — your choice." },
              { title: "Local routes", desc: "Serve customers across Humboldt County on your schedule." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl bg-white border border-foam p-5">
                <p className="font-semibold text-charcoal">{item.title}</p>
                <p className="mt-2 text-sm text-slate leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/auth/signup?role=driver" size="lg">
              Start application
            </ButtonLink>
            <p className="mt-4 text-xs text-slate">Application review typically within 48 hours.</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
