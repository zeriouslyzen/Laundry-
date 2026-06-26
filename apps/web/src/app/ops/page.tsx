"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, StatusBadge } from "@humboldt/ui";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { listPreviewOrders, updatePreviewOrderStatus } from "@/lib/preview-orders";
import { DEFAULT_ROUTE_SCHEDULE, LAUNCH_CITIES, SERVICE_TYPE_LABELS, type OrderStatus } from "@humboldt/db";

const ROUTE_SCHEDULE = DEFAULT_ROUTE_SCHEDULE;

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  driver_assigned: "en_route_pickup",
  en_route_pickup: "picked_up",
  picked_up: "washing",
  washing: "ready",
  ready: "en_route_return",
  en_route_return: "completed",
};

interface DbOrder {
  id: string;
  status: OrderStatus;
  pickup_date: string;
  pickup_window_start: string;
  bag_count: number;
  total_cents: number;
  service_type?: string;
  addresses?: { street: string; city: string };
  profiles?: { full_name: string; phone: string };
}

export default function OpsPage() {
  const [previewOrders, setPreviewOrders] = useState(listPreviewOrders());
  const [dbOrders, setDbOrders] = useState<DbOrder[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => setConnected(h.supabase));

    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((d) => setDbOrders(d.orders ?? []))
      .catch(() => {});
  }, []);

  function advancePreview(id: string, status: OrderStatus) {
    updatePreviewOrderStatus(id, status);
    setPreviewOrders(listPreviewOrders());
  }

  const allOrders = [
    ...dbOrders.map((o) => ({ ...o, source: "db" as const })),
    ...previewOrders.map((o) => ({
      id: o.id,
      status: o.status,
      pickup_date: o.pickupDate,
      pickup_window_start: o.pickupWindowStart,
      bag_count: o.loadCount,
      total_cents: o.totalCents,
      service_type: o.serviceType,
      addresses: { street: o.street, city: o.city },
      profiles: { full_name: o.customerEmail || "Preview guest", phone: o.customerPhone || "" },
      source: "preview" as const,
    })),
  ].sort((a, b) => a.pickup_date.localeCompare(b.pickup_date));

  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-4xl px-5 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-sm font-medium text-ocean uppercase tracking-wider">Team</p>
            <h1 className="font-display text-2xl font-semibold text-charcoal mt-1">Today&apos;s ops</h1>
            <p className="text-sm text-slate mt-1">
              {connected ? "Live orders from database" : "Preview orders on this device only"}
            </p>
          </div>
          <Link href="/book/new">
            <Button size="sm">+ Test booking</Button>
          </Link>
        </div>

        <Card padding="md" className="mb-8">
          <h2 className="font-semibold text-charcoal">Route schedule</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {ROUTE_SCHEDULE.map((r) => (
              <div key={r.day} className="rounded-lg bg-mist px-4 py-3">
                <p className="font-medium text-charcoal">{r.day}</p>
                <p className="text-sm text-slate">{r.area}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate">
            Routes adjust with demand. Launch cities: {LAUNCH_CITIES.join(", ")}
          </p>
        </Card>

        <h2 className="font-semibold text-charcoal mb-4">Orders ({allOrders.length})</h2>
        {allOrders.length === 0 ? (
          <Card className="text-center py-12 text-slate">
            No orders yet. Share the site or place a test booking.
          </Card>
        ) : (
          <div className="space-y-3">
            {allOrders.map((order) => {
              const next = NEXT_STATUS[order.status];
              return (
                <Card key={order.id} padding="sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-charcoal">
                        {order.addresses?.street}, {order.addresses?.city}
                      </p>
                      <p className="text-sm text-slate mt-0.5">
                        {order.pickup_date} · {order.pickup_window_start?.slice(0, 5)} ·{" "}
                        {order.bag_count} load{order.bag_count > 1 ? "s" : ""} · $
                        {((order.total_cents ?? 0) / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-slate mt-1">
                        {order.profiles?.full_name}
                        {order.profiles?.phone ? ` · ${order.profiles.phone}` : ""}
                        {order.service_type
                          ? ` · ${SERVICE_TYPE_LABELS[order.service_type as keyof typeof SERVICE_TYPE_LABELS] || order.service_type}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={order.status} />
                      {order.source === "preview" && next ? (
                        <Button size="sm" variant="soft" onClick={() => advancePreview(order.id, next)}>
                          → {next.replace(/_/g, " ")}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!connected ? (
          <Card padding="md" className="mt-8 bg-mist/50">
            <p className="text-sm text-slate">
              <strong className="text-charcoal">Connect Supabase</strong> to save orders permanently and log in as admin for full control. See README.md.
            </p>
          </Card>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
