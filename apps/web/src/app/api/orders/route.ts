import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { geocodeAddress, matchOrderToDrivers } from "@/lib/matching";
import {
  LAUNCH_PRICING,
  LAUNCH_ZIPS,
  LAUNCH_CITIES,
  calculateLaunchTotal,
  type ServiceType,
} from "@humboldt/db";
import { sendSMS, SMS_TEMPLATES } from "@/lib/sms";
import { isOwnerOperated } from "@/lib/owner-mode";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "PREVIEW_MODE", preview: true },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    street,
    city,
    zip,
    pickupDate,
    pickupWindowStart,
    pickupWindowEnd,
    returnMethod,
    recurringDay,
    loadCount,
    serviceType,
    addonSoap,
    addonDryerSheets,
    addonRush,
    customerNotes,
    seniorOrVeteran,
    studentGroupSize,
  } = body;

  if (!LAUNCH_ZIPS.includes(zip)) {
    return NextResponse.json(
      { error: "We currently serve Arcata, Eureka, Loleta, and Fields Landing only." },
      { status: 400 }
    );
  }

  if (!LAUNCH_CITIES.includes(city)) {
    return NextResponse.json({ error: "City not in launch service area." }, { status: 400 });
  }

  const coords = await geocodeAddress(street, city, "CA", zip);

  const { data: address, error: addrError } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      street,
      city,
      state: "CA",
      zip,
      lat: coords?.lat,
      lng: coords?.lng,
      is_default: true,
    })
    .select()
    .single();

  if (addrError) return NextResponse.json({ error: addrError.message }, { status: 500 });

  const typedService = (serviceType as ServiceType) || "full_service";
  const { totalCents } = calculateLaunchTotal(LAUNCH_PRICING, {
    serviceType: typedService,
    loadCount: loadCount || 1,
    city,
    returnMethod: returnMethod || "driver_delivery",
    addons: {
      soap: !!addonSoap,
      dryerSheets: !!addonDryerSheets,
      rush: !!addonRush,
    },
    recurring: !!recurringDay,
    seniorOrVeteran: !!seniorOrVeteran,
    studentGroupSize: studentGroupSize || 0,
  });

  const ownerOperated = isOwnerOperated();
  const initialStatus = ownerOperated ? "driver_assigned" : "pending_match";

  const orderRow: Record<string, unknown> = {
    customer_id: user.id,
    address_id: address.id,
    status: initialStatus,
    pickup_date: pickupDate,
    pickup_window_start: pickupWindowStart,
    pickup_window_end: pickupWindowEnd,
    return_method: returnMethod,
    recurring_day: recurringDay,
    bag_count: loadCount || 1,
    addon_soap: addonSoap,
    addon_dryer_sheets: addonDryerSheets,
    addon_fold: typedService === "full_service" || typedService === "dry_and_fold",
    addon_rush: addonRush,
    customer_notes: customerNotes,
    total_cents: totalCents,
    driver_payout_cents: totalCents,
    service_type: typedService,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderRow)
    .select()
    .single();

  if (orderError) {
    delete orderRow.service_type;
    const { data: fallback, error: fallbackError } = await supabase
      .from("orders")
      .insert(orderRow)
      .select()
      .single();
    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 });
    if (!fallback) return NextResponse.json({ error: "Failed to create order" }, { status: 500 });

    const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).single();
    if (profile?.phone) await sendSMS(profile.phone, SMS_TEMPLATES.orderConfirmed(fallback.id));
    return NextResponse.json({ orderId: fallback.id });
  }

  const { data: profile } = await supabase.from("profiles").select("phone").eq("id", user.id).single();
  if (profile?.phone) await sendSMS(profile.phone, SMS_TEMPLATES.orderConfirmed(order.id));

  if (!ownerOperated) {
    await matchOrderToDrivers(supabase, order.id);
  }

  return NextResponse.json({ orderId: order.id, totalCents });
}
