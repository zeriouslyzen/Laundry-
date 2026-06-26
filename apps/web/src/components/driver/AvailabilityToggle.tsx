"use client";

import { useState } from "react";
import { Button } from "@humboldt/ui";

export function AvailabilityToggleClient({ initialAvailable }: { initialAvailable: boolean }) {
  const [available, setAvailable] = useState(initialAvailable);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/driver/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: !available }),
    });
    if (res.ok) setAvailable(!available);
    setLoading(false);
  }

  return (
    <Button
      variant={available ? "primary" : "outline"}
      size="sm"
      loading={loading}
      onClick={toggle}
    >
      {available ? "Available" : "Offline"}
    </Button>
  );
}
