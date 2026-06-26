import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardTitle } from "@humboldt/ui";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AvailabilityToggleClient } from "@/components/driver/AvailabilityToggle";
import { OfferCardClient } from "@/components/driver/OfferCard";
import { LocationShareClient } from "@/components/driver/LocationShare";

export default async function DriverDashboard() {
  const profile = await getProfile();
  if (!profile) redirect("/auth/login?redirect=/driver");

  const supabase = await createClient();
  const { data: driverProfile } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("user_id", profile.id)
    .single();

  if (!driverProfile) redirect("/driver/apply");
  if (driverProfile.status === "pending" && driverProfile.onboarding_step < 6) {
    redirect("/driver/onboarding");
  }
  if (driverProfile.status !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#F7F6F3]">
        <Card className="max-w-md text-center">
          <CardTitle>Application under review</CardTitle>
          <p className="mt-4 text-[#5C6670]">
            Your driver application is being reviewed. We&apos;ll notify you when you&apos;re approved.
          </p>
        </Card>
      </div>
    );
  }

  const { data: pendingOffers } = await supabase
    .from("driver_offers")
    .select("*, orders(*, addresses(*))")
    .eq("driver_id", profile.id)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString());

  const { data: activeOrders } = await supabase
    .from("orders")
    .select("*, addresses(*)")
    .eq("driver_id", profile.id)
    .not("status", "in", '("completed","cancelled")')
    .order("pickup_date", { ascending: true });

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="border-b border-[#E5E3DE] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h1 className="font-semibold text-[#2C3338]">Driver</h1>
          <AvailabilityToggleClient initialAvailable={driverProfile.available} />
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-6 space-y-6">
        {pendingOffers && pendingOffers.length > 0 ? (
          <section>
            <h2 className="text-lg font-semibold text-[#2C3338] mb-3">New offers</h2>
            {pendingOffers.map((offer) => (
              <OfferCardClient key={offer.id} offer={offer as Parameters<typeof OfferCardClient>[0]["offer"]} />
            ))}
          </section>
        ) : null}

        <section>
          <h2 className="text-lg font-semibold text-[#2C3338] mb-3">Active jobs</h2>
          {activeOrders && activeOrders.length > 0 ? (
            activeOrders.map((order) => (
              <Link key={order.id} href={`/driver/orders/${order.id}`}>
                <Card className="mb-3 hover:border-[#4A6741]/30 cursor-pointer">
                  <p className="font-medium">{order.addresses?.street}</p>
                  <p className="text-sm text-[#5C6670]">
                    {new Date(order.pickup_date).toLocaleDateString()} · {order.status.replace(/_/g, " ")}
                  </p>
                </Card>
              </Link>
            ))
          ) : (
            <Card className="text-center py-8">
              <p className="text-[#5C6670]">No active jobs. Toggle available to receive offers.</p>
            </Card>
          )}
        </section>

        <LocationShareClient />
      </main>
    </div>
  );
}
