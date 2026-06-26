export type UserRole = "customer" | "driver" | "admin";
export type DriverStatus = "pending" | "active" | "suspended" | "rejected";
export type WashLocation = "home_machines" | "laundromat" | "both";
export type TurnaroundTime = "same_day" | "24h" | "48h";
export type OrderStatus =
  | "pending_match"
  | "finding_driver"
  | "driver_assigned"
  | "en_route_pickup"
  | "picked_up"
  | "washing"
  | "ready"
  | "en_route_return"
  | "awaiting_customer_pickup"
  | "completed"
  | "cancelled";
export type ReturnMethod = "driver_delivery" | "customer_pickup";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired";

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  status: DriverStatus;
  home_address: string | null;
  home_lat: number | null;
  home_lng: number | null;
  available: boolean;
  wash_location: WashLocation | null;
  max_loads_per_day: number;
  turnaround: TurnaroundTime;
  provides_soap: boolean;
  provides_dryer_sheets: boolean;
  provides_hypoallergenic: boolean;
  provides_fold: boolean;
  availability_days: number[];
  availability_start: string;
  availability_end: string;
  onboarding_step: number;
  rules_accepted_at: string | null;
  contractor_agreement_at: string | null;
  background_check_consent_at: string | null;
  active_orders_count: number;
  rating_avg: number;
  rating_count: number;
  current_lat: number | null;
  current_lng: number | null;
  location_updated_at: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lng: number | null;
  notes: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  driver_id: string | null;
  address_id: string;
  status: OrderStatus;
  pickup_date: string;
  pickup_window_start: string;
  pickup_window_end: string;
  return_method: ReturnMethod;
  return_date: string | null;
  return_window_start: string | null;
  return_window_end: string | null;
  recurring_day: number | null;
  addon_soap: boolean;
  addon_dryer_sheets: boolean;
  addon_fold: boolean;
  addon_rush: boolean;
  bag_count: number;
  customer_notes: string | null;
  base_fee_cents: number | null;
  total_cents: number | null;
  driver_payout_cents: number | null;
  stripe_payment_intent_id: string | null;
  payment_status: string;
  assigned_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderEvent {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  actor_id: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface DriverOffer {
  id: string;
  order_id: string;
  driver_id: string;
  status: OfferStatus;
  distance_miles: number | null;
  payout_cents: number | null;
  expires_at: string;
  responded_at: string | null;
  created_at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  base_pickup_fee_cents: number;
  per_bag_cents: number;
  fold_addon_cents: number;
  soap_addon_cents: number;
  dryer_sheets_addon_cents: number;
  rush_addon_cents: number;
  driver_payout_percent: number;
  active: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  zip_codes: string[];
  active: boolean;
  max_radius_miles: number;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_match: "Pending",
  finding_driver: "Finding driver",
  driver_assigned: "Driver assigned",
  en_route_pickup: "Driver en route",
  picked_up: "Picked up",
  washing: "Washing",
  ready: "Ready",
  en_route_return: "On the way back",
  awaiting_customer_pickup: "Ready for pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const HUMBOLDT_ZIPS = [
  "95501", "95503", "95519", "95521", "95524", "95528", "95536", "95537",
  "95540", "95542", "95546", "95547", "95551", "95553", "95555", "95558",
  "95560", "95562", "95564", "95565", "95569", "95570", "95573",
];

export const HUMBOLDT_CITIES = [
  "Arcata", "Eureka", "McKinleyville", "Fortuna", "Ferndale", "Trinidad",
  "Blue Lake", "Rio Dell", "Loleta", "Samoa", "Fields Landing",
];

export * from "./pricing";

export function calculateOrderTotal(
  pricing: PricingRule,
  bagCount: number,
  addons: { soap: boolean; dryerSheets: boolean; fold: boolean; rush: boolean }
): { totalCents: number; driverPayoutCents: number } {
  let total = pricing.base_pickup_fee_cents + pricing.per_bag_cents * bagCount;
  if (addons.soap) total += pricing.soap_addon_cents;
  if (addons.dryerSheets) total += pricing.dryer_sheets_addon_cents;
  if (addons.fold) total += pricing.fold_addon_cents;
  if (addons.rush) total += pricing.rush_addon_cents;
  const driverPayoutCents = Math.round(total * (pricing.driver_payout_percent / 100));
  return { totalCents: total, driverPayoutCents };
}

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
