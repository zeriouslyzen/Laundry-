import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle, OrderTimeline, StatusBadge } from "@humboldt/ui";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { OrderTrackingMap } from "@/components/OrderTrackingMap";
import { PaymentButton } from "@/components/PaymentButton";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) notFound();

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*, addresses(*), profiles!orders_driver_id_fkey(full_name, phone)")
    .eq("id", id)
    .eq("customer_id", profile.id)
    .single();

  if (!order) notFound();

  const { data: events } = await supabase
    .from("order_events")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  let driverLocation = null;
  if (order.driver_id) {
    const { data: driverProfile } = await supabase
      .from("driver_profiles")
      .select("current_lat, current_lng, location_updated_at")
      .eq("user_id", order.driver_id)
      .single();
    if (driverProfile?.current_lat && driverProfile?.current_lng) {
      driverLocation = {
        lat: driverProfile.current_lat,
        lng: driverProfile.current_lng,
        updatedAt: driverProfile.location_updated_at,
      };
    }
  }

  const activeStatuses = ["en_route_pickup", "en_route_return", "driver_assigned"];
  const showMap = driverLocation && activeStatuses.includes(order.status);

  return (
    <div className="min-h-screen bg-[#F7F6F3]">
      <header className="border-b border-[#E5E3DE] bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link href="/book" className="text-sm text-[#4A6741] hover:underline">← Back to orders</Link>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#2C3338]">Order status</h1>
          <StatusBadge status={order.status} />
        </div>

        {showMap && driverLocation ? (
          <OrderTrackingMap
            driverLat={driverLocation.lat}
            driverLng={driverLocation.lng}
            customerLat={order.addresses?.lat}
            customerLng={order.addresses?.lng}
          />
        ) : null}

        <Card>
          <CardTitle>Timeline</CardTitle>
          <div className="mt-4">
            <OrderTimeline events={events ?? []} currentStatus={order.status} />
          </div>
        </Card>

        <Card>
          <CardTitle>Details</CardTitle>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#5C6670]">Pickup</dt>
              <dd>{new Date(order.pickup_date).toLocaleDateString()} {order.pickup_window_start?.slice(0, 5)} – {order.pickup_window_end?.slice(0, 5)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#5C6670]">Address</dt>
              <dd className="text-right">{order.addresses?.street}, {order.addresses?.city}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#5C6670]">Total</dt>
              <dd className="font-semibold">${((order.total_cents ?? 0) / 100).toFixed(2)}</dd>
            </div>
            {order.profiles ? (
              <div className="flex justify-between">
                <dt className="text-[#5C6670]">Driver</dt>
                <dd>{order.profiles.full_name}</dd>
              </div>
            ) : null}
          </dl>
        </Card>

        {order.payment_status === "pending" && order.total_cents ? (
          <PaymentButton orderId={order.id} amountCents={order.total_cents} />
        ) : null}
      </main>
    </div>
  );
}
