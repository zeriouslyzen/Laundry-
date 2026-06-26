import { ButtonLink } from "@humboldt/ui";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/community", label: "Community" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-foam bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <ButtonLink
              key={item.href}
              href={item.href}
              variant="ghost"
              size="sm"
              className="!min-h-0 !px-0 !py-0 !border-0 !shadow-none font-medium"
            >
              {item.label}
            </ButtonLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <ButtonLink href="/auth/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </ButtonLink>
          <ButtonLink href="/book/new" size="sm">
            Book pickup
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-foam bg-charcoal text-white">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="font-semibold text-lg">North Coast Laundry</p>
            <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-sm">
              Professional pickup, wash, fold, and delivery in Arcata, Eureka, Loleta &amp; Fields Landing.
            </p>
            <a href="tel:+17075550100" className="mt-4 inline-block text-sky font-medium hover:text-white">
              (707) 555-0100
            </a>
          </div>
          <div>
            <p className="font-medium text-sm uppercase tracking-wider text-white/50 mb-3">Company</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <ButtonLink href="/about" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                About us
              </ButtonLink>
              <ButtonLink href="/news" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                News
              </ButtonLink>
              <ButtonLink href="/how-it-works" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                How it works
              </ButtonLink>
              <ButtonLink href="/pricing" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                Pricing
              </ButtonLink>
              <ButtonLink href="/contact" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                Contact
              </ButtonLink>
            </div>
          </div>
          <div>
            <p className="font-medium text-sm uppercase tracking-wider text-white/50 mb-3">Get started</p>
            <div className="flex flex-col gap-2.5 text-sm">
              <ButtonLink href="/book/new" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                Book a pickup
              </ButtonLink>
              <ButtonLink href="/community" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-sky hover:!bg-transparent hover:!text-white">
                Community suggestions
              </ButtonLink>
              <ButtonLink href="/docs/terms" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-white/60 hover:!bg-transparent hover:!text-white">
                Terms of Service
              </ButtonLink>
              <ButtonLink href="/ops" variant="ghost" size="sm" className="!justify-start !px-0 !py-1 !min-h-0 !border-0 !text-white/40 hover:!bg-transparent hover:!text-white/70">
                Team ops
              </ButtonLink>
            </div>
          </div>
        </div>
        <p className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/50">
          © {new Date().getFullYear()} North Coast Laundry. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
