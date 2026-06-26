export type ServiceType = "full_service" | "wash_dry_only" | "dry_only" | "dry_and_fold";

export type ServiceZone = "core" | "extended";

/** List prices include 5% markup; seniors/veterans get 5% off list (≈ underlying rate). */
export const LIST_PRICE_MARKUP = 0.05;
export const SENIOR_VETERAN_DISCOUNT = 0.05;

/** Launch cities — owner-operated */
export const LAUNCH_CITIES = [
  "Arcata",
  "Eureka",
  "Loleta",
  "Fields Landing",
] as const;

export const EXTENDED_ZONE_CITIES = ["Loleta", "Fields Landing"] as const;

export const LAUNCH_ZIPS = ["95521", "95501", "95503", "95551", "95537"];

export interface LaunchPricing {
  fullServicePerLoadCents: number;
  washDryOnlyPerLoadCents: number;
  dryOnlyPerLoadCents: number;
  dryAndFoldPerLoadCents: number;
  extendedZoneSurchargeCents: number;
  soapAddonCents: number;
  dryerSheetsAddonCents: number;
  rushAddonCents: number;
  selfPickupDiscountCents: number;
  minimumOrderCents: number;
}

/** Underlying costs — list prices add 5% via LIST_PRICE_MARKUP */
export const LAUNCH_PRICING: LaunchPricing = {
  fullServicePerLoadCents: 2600,
  washDryOnlyPerLoadCents: 2100,
  dryOnlyPerLoadCents: 1500,
  dryAndFoldPerLoadCents: 2000,
  extendedZoneSurchargeCents: 400,
  soapAddonCents: 200,
  dryerSheetsAddonCents: 150,
  rushAddonCents: 800,
  selfPickupDiscountCents: 400,
  minimumOrderCents: 2200,
};

export function toListPriceCents(baseCents: number): number {
  return Math.round(baseCents * (1 + LIST_PRICE_MARKUP));
}

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

export function getListPricing(pricing: LaunchPricing = LAUNCH_PRICING) {
  return {
    fullService: toListPriceCents(pricing.fullServicePerLoadCents),
    washDryOnly: toListPriceCents(pricing.washDryOnlyPerLoadCents),
    dryOnly: toListPriceCents(pricing.dryOnlyPerLoadCents),
    dryAndFold: toListPriceCents(pricing.dryAndFoldPerLoadCents),
    minimum: toListPriceCents(pricing.minimumOrderCents),
    zoneSurcharge: toListPriceCents(pricing.extendedZoneSurchargeCents),
  };
}

export function getStudentGroupDiscountPercent(groupSize: number): number {
  if (groupSize >= 4) return 0.1;
  if (groupSize >= 2) return 0.05;
  return 0;
}

export function getServiceZone(city: string): ServiceZone {
  return EXTENDED_ZONE_CITIES.includes(city as (typeof EXTENDED_ZONE_CITIES)[number])
    ? "extended"
    : "core";
}

export function calculateLaunchTotal(
  pricing: LaunchPricing,
  options: {
    serviceType: ServiceType;
    loadCount: number;
    city: string;
    returnMethod: "driver_delivery" | "customer_pickup";
    addons: { soap: boolean; dryerSheets: boolean; rush: boolean };
    recurring?: boolean;
    seniorOrVeteran?: boolean;
    studentGroupSize?: number;
  }
): { totalCents: number; breakdown: Record<string, number> } {
  const {
    serviceType,
    loadCount,
    city,
    returnMethod,
    addons,
    recurring,
    seniorOrVeteran,
    studentGroupSize = 0,
  } = options;

  const perLoadRates: Record<ServiceType, number> = {
    full_service: toListPriceCents(pricing.fullServicePerLoadCents),
    wash_dry_only: toListPriceCents(pricing.washDryOnlyPerLoadCents),
    dry_only: toListPriceCents(pricing.dryOnlyPerLoadCents),
    dry_and_fold: toListPriceCents(pricing.dryAndFoldPerLoadCents),
  };

  let total = perLoadRates[serviceType] * loadCount;
  const breakdown: Record<string, number> = {
    service: perLoadRates[serviceType] * loadCount,
  };

  if (getServiceZone(city) === "extended") {
    const zoneFee = toListPriceCents(pricing.extendedZoneSurchargeCents);
    breakdown.zoneSurcharge = zoneFee;
    total += zoneFee;
  }

  if (addons.soap) {
    const fee = toListPriceCents(pricing.soapAddonCents);
    breakdown.soap = fee;
    total += fee;
  }
  if (addons.dryerSheets) {
    const fee = toListPriceCents(pricing.dryerSheetsAddonCents);
    breakdown.dryerSheets = fee;
    total += fee;
  }
  if (addons.rush) {
    const fee = toListPriceCents(pricing.rushAddonCents);
    breakdown.rush = fee;
    total += fee;
  }

  if (recurring) {
    const discount = Math.round(total * 0.1);
    breakdown.recurringDiscount = -discount;
    total -= discount;
  }

  const studentPct = getStudentGroupDiscountPercent(studentGroupSize);
  if (studentPct > 0) {
    const discount = Math.round(total * studentPct);
    breakdown.studentGroupDiscount = -discount;
    total -= discount;
  }

  if (seniorOrVeteran) {
    const discount = Math.round(total * SENIOR_VETERAN_DISCOUNT);
    breakdown.seniorVeteranDiscount = -discount;
    total -= discount;
  }

  if (returnMethod === "customer_pickup") {
    breakdown.selfPickupDiscount = -pricing.selfPickupDiscountCents;
    total -= pricing.selfPickupDiscountCents;
  }

  const listMinimum = toListPriceCents(pricing.minimumOrderCents);
  if (total < listMinimum) {
    breakdown.minimumAdjustment = listMinimum - total;
    total = listMinimum;
  }

  return { totalCents: Math.max(total, 0), breakdown };
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  full_service: "Wash + dry + fold (full service)",
  wash_dry_only: "Wash + dry only (no fold)",
  dry_only: "Dry only (you hand-washed)",
  dry_and_fold: "Dry + fold (you hand-washed)",
};

/** Default route schedule — adjusts based on customer demand */
export const DEFAULT_ROUTE_SCHEDULE = [
  { day: "Tuesday", area: "Arcata" },
  { day: "Wednesday", area: "Eureka" },
  { day: "Friday", area: "Loleta" },
] as const;
