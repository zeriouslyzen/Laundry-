"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, OrderTimeline, StatusBadge } from "@humboldt/ui";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { getPreviewOrder, type PreviewOrder } from "@/lib/preview-orders";
import { SERVICE_TYPE_LABELS } from "@humboldt/db";
import type { OrderStatus } from "@humboldt/db";

export default function LocalOrderPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<PreviewOrder | null>(null);

  useEffect(() => {
    setOrder(getPreviewOrder(id));
  }, [id]);

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col bg-fog">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-5">
          <Card className="text-center max-w-md">
            <p className="text-slate">Order not found. It may have been cleared from this browser.</p>
            <Link href="/book/new" className="mt-4 inline-block">
              <Button>Book again</Button>
            </Link>
          </Card>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const events = [
    {
      id: "1",
      order_id: order.id,
      status: order.status,
      note: "Preview order — connect Supabase to save orders permanently.",
      actor_id: null,
      lat: null,
      lng: null,
      created_at: order.createdAt,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg px-5 py-8 space-y-6 text-base">
        <div className="rounded-xl bg-mist border border-foam px-4 py-4 text-slate leading-relaxed">
          Preview booking saved on this device. We&apos;ll confirm by email or phone once live.{" "}
          <a href="tel:+17075550100" className="font-semibold text-ocean hover:underline">
            Call (707) 555-0100
          </a>
        </div>

        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-semibold text-charcoal">Order status</h1>
          <StatusBadge status={order.status as OrderStatus} />
        </div>

        <Card>
          <CardTitle>Timeline</CardTitle>
          <div className="mt-4">
            <OrderTimeline events={events} currentStatus={order.status as OrderStatus} />
          </div>
        </Card>

        <Card>
          <CardTitle>Details</CardTitle>
          <dl className="mt-4 space-y-3 text-base">
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Service</dt>
              <dd className="text-right">{SERVICE_TYPE_LABELS[order.serviceType]}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Loads</dt>
              <dd>{order.loadCount}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Pickup</dt>
              <dd className="text-right">
                {order.pickupDate} · {order.pickupWindowStart?.slice(0, 5)}–{order.pickupWindowEnd?.slice(0, 5)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Address</dt>
              <dd className="text-right">{order.street}, {order.city}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate">Total</dt>
              <dd className="font-semibold text-ocean">${(order.totalCents / 100).toFixed(2)}</dd>
            </div>
          </dl>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
