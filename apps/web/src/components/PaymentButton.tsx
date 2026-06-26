"use client";

import { useState } from "react";
import { Button } from "@humboldt/ui";

interface PaymentButtonProps {
  orderId: string;
  amountCents: number;
}

export function PaymentButton({ orderId, amountCents }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/payments/create-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, amountCents }),
    });
    const data = await res.json();
    if (data.mock) {
      await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      setPaid(true);
    }
    setLoading(false);
  }

  if (paid) {
    return (
      <div className="rounded-lg bg-[#7A9E7E]/20 p-4 text-center text-[#4A6741] font-medium">
        Payment received — thank you!
      </div>
    );
  }

  return (
    <Button fullWidth size="lg" loading={loading} onClick={handlePay}>
      Pay ${(amountCents / 100).toFixed(2)}
    </Button>
  );
}
