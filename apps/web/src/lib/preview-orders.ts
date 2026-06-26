import type { OrderStatus, ReturnMethod, ServiceType } from "@humboldt/db";

export interface PreviewOrder {
  id: string;
  createdAt: string;
  status: OrderStatus;
  serviceType: ServiceType;
  loadCount: number;
  street: string;
  city: string;
  zip: string;
  pickupDate: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  returnMethod: ReturnMethod;
  recurring: boolean;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
  totalCents: number;
  addonSoap: boolean;
  addonDryerSheets: boolean;
  addonRush: boolean;
}

const STORAGE_KEY = "ncl_preview_orders";

export function savePreviewOrder(order: Omit<PreviewOrder, "id" | "createdAt" | "status">): PreviewOrder {
  const full: PreviewOrder = {
    ...order,
    id: `preview-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "driver_assigned",
  };
  const existing = listPreviewOrders();
  existing.unshift(full);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 20)));
  return full;
}

export function listPreviewOrders(): PreviewOrder[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as PreviewOrder[];
  } catch {
    return [];
  }
}

export function getPreviewOrder(id: string): PreviewOrder | null {
  return listPreviewOrders().find((o) => o.id === id) ?? null;
}

export function updatePreviewOrderStatus(id: string, status: OrderStatus): void {
  const orders = listPreviewOrders().map((o) => (o.id === id ? { ...o, status } : o));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}
