"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@humboldt/ui";

interface OfferCardClientProps {
  offer: {
    id: string;
    payout_cents: number | null;
    distance_miles: number | null;
    orders: {
      addresses: { street: string; city: string };
      pickup_date: string;
    };
  };
}

export function OfferCardClient({ offer }: OfferCardClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function respond(action: "accept" | "decline") {
    setLoading(action);
    await fetch(`/api/offers/${offer.id}/${action}`, { method: "POST" });
    setLoading(null);
    router.refresh();
  }

  return (
    <Card className="mb-3 border-[#C4A574]/40">
      <p className="font-medium text-[#2C3338]">{offer.orders.addresses.street}</p>
      <p className="text-sm text-[#5C6670]">
        {offer.orders.addresses.city} · {new Date(offer.orders.pickup_date).toLocaleDateString()}
      </p>
      <p className="mt-2 text-lg font-bold text-[#4A6741]">
        ${((offer.payout_cents ?? 0) / 100).toFixed(2)} payout
        {offer.distance_miles ? ` · ${offer.distance_miles.toFixed(1)} mi` : ""}
      </p>
      <div className="mt-4 flex gap-2">
        <Button fullWidth loading={loading === "accept"} onClick={() => respond("accept")}>
          Accept
        </Button>
        <Button variant="outline" fullWidth loading={loading === "decline"} onClick={() => respond("decline")}>
          Decline
        </Button>
      </div>
    </Card>
  );
}
