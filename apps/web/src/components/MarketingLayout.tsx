import { ButtonLink } from "@humboldt/ui";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

interface MarketingLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function MarketingLayout({ children, title, subtitle }: MarketingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-foam bg-gradient-to-br from-mist via-fog to-white px-5 py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <ButtonLink href="/" variant="ghost" size="sm" className="!px-0 !min-h-0 mb-6">
              ← Back home
            </ButtonLink>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-charcoal tracking-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 text-lg text-slate leading-relaxed">{subtitle}</p>
            ) : null}
          </div>
        </section>
        <section className="px-5 py-16">
          <div className="mx-auto max-w-3xl">{children}</div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageCta() {
  return (
    <div className="mt-12 flex flex-wrap gap-4">
      <ButtonLink href="/book/new" size="lg">
        Schedule pickup
      </ButtonLink>
      <ButtonLink href="/contact" variant="outline" size="lg">
        Contact us
      </ButtonLink>
    </div>
  );
}
