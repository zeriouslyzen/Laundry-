"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle } from "@humboldt/ui";
import type { OrderStatus } from "@humboldt/db";

const STATUS_FLOW: { status: OrderStatus; label: string }[] = [
  { status: "en_route_pickup", label: "En route to pickup" },
  { status: "picked_up", label: "Picked up" },
  { status: "washing", label: "Washing" },
  { status: "ready", label: "Ready" },
  { status: "en_route_return", label: "En route to deliver" },
  { status: "awaiting_customer_pickup", label: "Ready for customer pickup" },
  { status: "completed", label: "Completed" },
];

export default function DriverOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [order, setOrder] = useState<{
    id: string;
    status: OrderStatus;
    return_method: string;
    addresses: { street: string; city: string; lat?: number; lng?: number };
    customer_notes: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then(setOrder);
  }, [id]);

  async function updateStatus(status: OrderStatus) {
    setLoading(true);
    await fetch(`/api/orders/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    router.refresh();
    if (order) setOrder({ ...order, status });
  }

  if (!order) {
    return <div className="p-8 text-center text-[#5C6670]">Loading...</div>;
  }

  const nextStatuses = STATUS_FLOW.filter((s) => {
    if (order.return_method === "customer_pickup" && s.status === "en_route_return") return false;
    if (order.return_method === "driver_delivery" && s.status === "awaiting_customer_pickup") return false;
    return true;
  });

  const currentIdx = nextStatuses.findIndex((s) => s.status === order.status);
  const nextStatus = nextStatuses[currentIdx + 1];

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="border-b border-[#E5E3DE] bg-white px-4 py-4">
        <Link href="/driver" className="text-sm text-[#4A6741] hover:underline">← Back</Link>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8">
        <Card>
          <CardTitle>{order.addresses?.street}</CardTitle>
          <p className="text-sm text-[#5C6670]">{order.addresses?.city}</p>
          {order.customer_notes ? (
            <p className="mt-2 text-sm bg-[#EFEDE8] p-3 rounded-lg">{order.customer_notes}</p>
          ) : null}
          <p className="mt-4 text-sm">Status: <strong>{order.status.replace(/_/g, " ")}</strong></p>

          {order.addresses?.lat && order.addresses?.lng ? (
            <a
              href={`https://maps.google.com/?q=${order.addresses.lat},${order.addresses.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-sm text-[#4A6741] hover:underline"
            >
              Navigate to address →
            </a>
          ) : null}

          {nextStatus ? (
            <Button
              fullWidth
              size="lg"
              className="mt-6"
              loading={loading}
              onClick={() => updateStatus(nextStatus.status)}
            >
              Mark: {nextStatus.label}
            </Button>
          ) : null}
        </Card>
      </main>
    </div>
  );
}
