import Link from "next/link";
import { redirect } from "next/navigation";
import { ButtonLink, Card, StatusBadge } from "@humboldt/ui";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { AppNav } from "@/components/AppNav";

export default async function BookDashboard() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="min-h-screen bg-fog">
        <AppNav />
        <main className="mx-auto max-w-2xl px-5 py-8">
          <h1 className="font-display text-2xl font-semibold text-charcoal">My laundry</h1>
          <Card variant="glass" className="mt-8 text-center py-14">
            <p className="text-slate">Sign in to view your orders, or schedule a pickup below.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <ButtonLink href="/auth/login?redirect=/book">Log in</ButtonLink>
              <ButtonLink href="/book/new" variant="outline">Schedule pickup</ButtonLink>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const profile = await getProfile();
  if (!profile) redirect("/auth/login?redirect=/book");

  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-fog">
      <AppNav userLabel={profile.full_name || profile.email} />
      <main className="mx-auto max-w-2xl px-5 py-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-ocean uppercase tracking-wider">Your orders</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-charcoal mt-1">
              My laundry
            </h1>
          </div>
          <ButtonLink href="/book/new">Book pickup</ButtonLink>
        </div>

        <div className="mt-8 space-y-3">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <Link key={order.id} href={`/book/orders/${order.id}`}>
                <Card variant="elevated" className="card-lift cursor-pointer hover:ring-2 hover:ring-ocean/10 transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-charcoal">
                        Pickup {new Date(order.pickup_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      </p>
                      <p className="text-sm text-slate mt-0.5">
                        {order.bag_count} bag{order.bag_count > 1 ? "s" : ""} · ${((order.total_cents ?? 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </Card>
              </Link>
            ))
          ) : (
            <Card variant="glass" className="text-center py-14">
              <p className="font-display text-xl text-charcoal">No orders yet</p>
              <p className="text-slate mt-2 text-sm max-w-xs mx-auto">
                Schedule your first pickup and we&apos;ll take it from there.
              </p>
              <div className="mt-6">
                <ButtonLink href="/book/new" size="lg">
                  Schedule your first pickup
                </ButtonLink>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
