import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";

export default async function TermsPage() {
  const fs = await import("fs/promises");
  const path = await import("path");
  let content = "";
  try {
    content = await fs.readFile(
      path.join(process.cwd(), "../../docs/terms.md"),
      "utf-8"
    );
  } catch {
    content = "Terms of service document not found.";
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-12 prose prose-neutral">
        <article className="whitespace-pre-wrap text-sm text-[#5C6670] leading-relaxed">
          {content}
        </article>
        <Link href="/" className="mt-8 inline-block text-[#4A6741] hover:underline">
          ← Back home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
