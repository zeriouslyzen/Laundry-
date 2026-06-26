"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@humboldt/ui";

export function DriverApprovalActions({
  driverId,
  userId,
}: {
  driverId: string;
  userId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    await fetch("/api/admin/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ driverId, userId, action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" loading={loading === "approve"} onClick={() => handleAction("approve")}>
        Approve
      </Button>
      <Button variant="danger" size="sm" loading={loading === "reject"} onClick={() => handleAction("reject")}>
        Reject
      </Button>
    </div>
  );
}
