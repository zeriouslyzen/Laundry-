import { redirect } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, StatusBadge } from "@humboldt/ui";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DriverApprovalActions } from "@/components/admin/DriverApprovalActions";
import { PricingForm } from "@/components/admin/PricingForm";

export default async function AdminDashboard() {
  const profile = await requireRole(["admin"]);
  if (!profile) redirect("/auth/login?redirect=/admin");

  const supabase = await createClient();

  const { data: pendingDrivers } = await supabase
    .from("driver_profiles")
    .select("*, profiles(full_name, email, phone)")
    .eq("status", "pending")
    .gte("onboarding_step", 6);

  const { data: orders } = await supabase
    .from("orders")
    .select("*, addresses(street, city), profiles!orders_customer_id_fkey(full_name)")
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: pricing } = await supabase
    .from("pricing_rules")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  const { data: serviceArea } = await supabase
    .from("service_areas")
    .select("*")
    .eq("active", true)
    .limit(1)
    .single();

  const today = new Date().toISOString().split("T")[0];
  const ordersToday = orders?.filter((o) => o.created_at.startsWith(today)).length ?? 0;
  const completedOrders = orders?.filter((o) => o.status === "completed").length ?? 0;

  return (
    <div className="min-h-screen bg-fog">
      <header className="border-b border-[#E5E3DE] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="font-semibold text-charcoal">Admin</h1>
          <p className="text-xs text-slate">North Coast Laundry</p>
          <Link href="/">
            <Button variant="ghost" size="sm">Exit</Button>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
          <Card padding="sm">
            <p className="text-sm text-[#5C6670]">Orders today</p>
            <p className="text-2xl font-bold text-[#2C3338]">{ordersToday}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-[#5C6670]">Completed (recent)</p>
            <p className="text-2xl font-bold text-[#4A6741]">{completedOrders}</p>
          </Card>
          <Card padding="sm">
            <p className="text-sm text-[#5C6670]">Pending drivers</p>
            <p className="text-2xl font-bold text-[#C4A574]">{pendingDrivers?.length ?? 0}</p>
          </Card>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-4">Driver applications</h2>
          {pendingDrivers && pendingDrivers.length > 0 ? (
            <div className="space-y-3">
              {pendingDrivers.map((driver) => (
                <Card key={driver.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{driver.profiles?.full_name}</p>
                      <p className="text-sm text-[#5C6670]">
                        {driver.profiles?.email} · {driver.home_address}
                      </p>
                      <p className="text-xs text-[#5C6670] mt-1">
                        Wash: {driver.wash_location} · Max {driver.max_loads_per_day} loads · {driver.turnaround}
                      </p>
                    </div>
                    <DriverApprovalActions driverId={driver.id} userId={driver.user_id} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-6 text-[#5C6670]">No pending applications</Card>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Recent orders</h2>
          <div className="space-y-2">
            {orders?.map((order) => (
              <Card key={order.id} padding="sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">
                      {order.profiles?.full_name} — {order.addresses?.street}
                    </p>
                    <p className="text-xs text-[#5C6670]">
                      {new Date(order.created_at).toLocaleString()} · ${((order.total_cents ?? 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardTitle>Pricing</CardTitle>
            {pricing ? <PricingForm pricing={pricing} /> : <p className="text-sm text-[#5C6670]">No pricing configured</p>}
          </Card>
          <Card>
            <CardTitle>Service area</CardTitle>
            {serviceArea ? (
              <div className="mt-4 text-sm text-[#5C6670]">
                <p className="font-medium text-[#2C3338]">{serviceArea.name}</p>
                <p className="mt-2">Max radius: {serviceArea.max_radius_miles} miles</p>
                <p className="mt-2">{serviceArea.zip_codes.length} ZIP codes covered</p>
                <p className="mt-2 text-xs">{serviceArea.zip_codes.join(", ")}</p>
              </div>
            ) : null}
          </Card>
        </section>
      </main>
    </div>
  );
}
