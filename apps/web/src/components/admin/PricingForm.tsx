"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@humboldt/ui";
import type { PricingRule } from "@humboldt/db";

export function PricingForm({ pricing }: { pricing: PricingRule }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [baseFee, setBaseFee] = useState((pricing.base_pickup_fee_cents / 100).toString());
  const [perBag, setPerBag] = useState((pricing.per_bag_cents / 100).toString());
  const [foldAddon, setFoldAddon] = useState((pricing.fold_addon_cents / 100).toString());

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: pricing.id,
        basePickupFeeCents: Math.round(parseFloat(baseFee) * 100),
        perBagCents: Math.round(parseFloat(perBag) * 100),
        foldAddonCents: Math.round(parseFloat(foldAddon) * 100),
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="mt-4 space-y-3">
      <Input label="Base pickup fee ($)" type="number" step="0.01" value={baseFee} onChange={(e) => setBaseFee(e.target.value)} />
      <Input label="Per bag ($)" type="number" step="0.01" value={perBag} onChange={(e) => setPerBag(e.target.value)} />
      <Input label="Fold add-on ($)" type="number" step="0.01" value={foldAddon} onChange={(e) => setFoldAddon(e.target.value)} />
      <Button type="submit" size="sm" loading={loading}>Save pricing</Button>
    </form>
  );
}
