import type { SupabaseClient } from "@supabase/supabase-js";
import {
  calculateOrderTotal,
  haversineMiles,
  type DriverProfile,
  type Order,
  type PricingRule,
} from "@humboldt/db";

const OFFER_TIMEOUT_SECONDS = 90;

export async function geocodeAddress(
  street: string,
  city: string,
  state: string,
  zip: string
): Promise<{ lat: number; lng: number } | null> {
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  if (!token) {
    // Fallback coords for Humboldt (Eureka center) when no Mapbox token
    return { lat: 40.8021, lng: -124.1637 };
  }
  const query = encodeURIComponent(`${street}, ${city}, ${state} ${zip}`);
  const res = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${token}&limit=1`
  );
  if (!res.ok) return null;
  const data = await res.json();
  const [lng, lat] = data.features?.[0]?.center ?? [];
  if (lat == null || lng == null) return null;
  return { lat, lng };
}

export function rankDrivers(
  drivers: (DriverProfile & { profiles?: { full_name: string } })[],
  orderLat: number,
  orderLng: number,
  maxRadius: number
) {
  return drivers
    .map((d) => {
      const lat = d.home_lat ?? d.current_lat;
      const lng = d.home_lng ?? d.current_lng;
      if (lat == null || lng == null) return null;
      const distance = haversineMiles(lat, lng, orderLat, orderLng);
      if (distance > maxRadius) return null;
      const capacityScore = (d.max_loads_per_day - d.active_orders_count) / d.max_loads_per_day;
      const ratingScore = d.rating_avg / 5;
      const distanceScore = 1 - distance / maxRadius;
      const score = distanceScore * 0.5 + capacityScore * 0.3 + ratingScore * 0.2;
      return { driver: d, distance, score };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.score - a.score);
}

export async function createDriverOffer(
  supabase: SupabaseClient,
  order: Order,
  driverId: string,
  distanceMiles: number,
  payoutCents: number
) {
  const expiresAt = new Date(Date.now() + OFFER_TIMEOUT_SECONDS * 1000).toISOString();
  const { data, error } = await supabase
    .from("driver_offers")
    .insert({
      order_id: order.id,
      driver_id: driverId,
      status: "pending",
      distance_miles: distanceMiles,
      payout_cents: payoutCents,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("orders")
    .update({ status: "finding_driver" })
    .eq("id", order.id);

  return data;
}

export async function matchOrderToDrivers(
  supabase: SupabaseClient,
  orderId: string
) {
  const { data: order } = await supabase
    .from("orders")
    .select("*, addresses(*)")
    .eq("id", orderId)
    .single();

  if (!order || !order.addresses) return { matched: false, reason: "Order not found" };

  const address = order.addresses;
  if (!address.lat || !address.lng) {
    return { matched: false, reason: "Address not geocoded" };
  }

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

  if (!serviceArea?.zip_codes.includes(address.zip)) {
    return { matched: false, reason: "Outside service area" };
  }

  const { data: existingOffers } = await supabase
    .from("driver_offers")
    .select("driver_id")
    .eq("order_id", orderId);

  const excludedDriverIds = new Set(existingOffers?.map((o) => o.driver_id) ?? []);

  const { data: drivers } = await supabase
    .from("driver_profiles")
    .select("*")
    .eq("status", "active")
    .eq("available", true)

  const eligible = (drivers ?? []).filter(
    (d) =>
      !excludedDriverIds.has(d.user_id) &&
      d.active_orders_count < d.max_loads_per_day
  );

  const ranked = rankDrivers(
    eligible,
    address.lat,
    address.lng,
    Number(serviceArea?.max_radius_miles ?? 25)
  );

  if (ranked.length === 0) {
    await supabase
      .from("orders")
      .update({ status: "finding_driver" })
      .eq("id", orderId);
    return { matched: false, reason: "No available drivers" };
  }

  const best = ranked[0];
  const payoutCents =
    order.driver_payout_cents ??
    (pricing
      ? calculateOrderTotal(pricing as PricingRule, order.bag_count, {
          soap: order.addon_soap,
          dryerSheets: order.addon_dryer_sheets,
          fold: order.addon_fold,
          rush: order.addon_rush,
        }).driverPayoutCents
      : 750);

  const offer = await createDriverOffer(
    supabase,
    order as Order,
    best.driver.user_id,
    best.distance,
    payoutCents
  );

  return { matched: true, offer, driver: best.driver };
}

export async function acceptOffer(
  supabase: SupabaseClient,
  offerId: string,
  driverId: string
) {
  const { data: offer } = await supabase
    .from("driver_offers")
    .select("*, orders(*)")
    .eq("id", offerId)
    .eq("driver_id", driverId)
    .eq("status", "pending")
    .single();

  if (!offer) return { success: false, error: "Offer not found" };
  if (new Date(offer.expires_at) < new Date()) {
    await supabase.from("driver_offers").update({ status: "expired" }).eq("id", offerId);
    return { success: false, error: "Offer expired" };
  }

  await supabase
    .from("driver_offers")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", offerId);

  await supabase
    .from("driver_offers")
    .update({ status: "declined" })
    .eq("order_id", offer.order_id)
    .neq("id", offerId)
    .eq("status", "pending");

  await supabase
    .from("orders")
    .update({
      driver_id: driverId,
      status: "driver_assigned",
      assigned_at: new Date().toISOString(),
    })
    .eq("id", offer.order_id);

  const { data: dp } = await supabase
    .from("driver_profiles")
    .select("active_orders_count")
    .eq("user_id", driverId)
    .single();
  if (dp) {
    await supabase
      .from("driver_profiles")
      .update({ active_orders_count: dp.active_orders_count + 1 })
      .eq("user_id", driverId);
  }

  return { success: true, orderId: offer.order_id };
}

export async function declineOffer(
  supabase: SupabaseClient,
  offerId: string,
  driverId: string
) {
  const { data: offer } = await supabase
    .from("driver_offers")
    .select("*")
    .eq("id", offerId)
    .eq("driver_id", driverId)
    .single();

  if (!offer) return { success: false };

  await supabase
    .from("driver_offers")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", offerId);

  await matchOrderToDrivers(supabase, offer.order_id);
  return { success: true };
}

export async function processExpiredOffers(supabase: SupabaseClient) {
  const { data: expired } = await supabase
    .from("driver_offers")
    .select("*")
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString());

  for (const offer of expired ?? []) {
    await supabase.from("driver_offers").update({ status: "expired" }).eq("id", offer.id);
    await matchOrderToDrivers(supabase, offer.order_id);
  }

  return { processed: expired?.length ?? 0 };
}
