"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Checkbox,
} from "@humboldt/ui";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import {
  LAUNCH_CITIES,
  LAUNCH_PRICING,
  calculateLaunchTotal,
  SERVICE_TYPE_LABELS,
  getServiceZone,
  toListPriceCents,
  formatCents,
  getStudentGroupDiscountPercent,
  type ServiceType,
} from "@humboldt/db";
import { savePreviewOrder } from "@/lib/preview-orders";

const TIME_WINDOWS = [
  { value: "08:00-10:00", label: "8:00 AM – 10:00 AM" },
  { value: "10:00-12:00", label: "10:00 AM – 12:00 PM" },
  { value: "12:00-14:00", label: "12:00 PM – 2:00 PM" },
  { value: "14:00-16:00", label: "2:00 PM – 4:00 PM" },
  { value: "16:00-18:00", label: "4:00 PM – 6:00 PM" },
  { value: "18:00-20:00", label: "6:00 PM – 8:00 PM" },
];

const RECURRING_DAYS = [
  { value: "", label: "One-time pickup" },
  { value: "1", label: "Every Monday" },
  { value: "2", label: "Every Tuesday" },
  { value: "3", label: "Every Wednesday" },
  { value: "4", label: "Every Thursday" },
  { value: "5", label: "Every Friday" },
];

const SERVICE_OPTIONS = (Object.keys(SERVICE_TYPE_LABELS) as ServiceType[]).map((key) => ({
  value: key,
  label: SERVICE_TYPE_LABELS[key],
}));

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Arcata");
  const [zip, setZip] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [timeWindow, setTimeWindow] = useState("10:00-12:00");
  const [returnMethod, setReturnMethod] = useState<"driver_delivery" | "customer_pickup">("driver_delivery");
  const [recurringDay, setRecurringDay] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("full_service");
  const [loadCount, setLoadCount] = useState(1);
  const [addonSoap, setAddonSoap] = useState(false);
  const [addonDryerSheets, setAddonDryerSheets] = useState(false);
  const [addonRush, setAddonRush] = useState(false);
  const [notes, setNotes] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [seniorOrVeteran, setSeniorOrVeteran] = useState(false);
  const [studentGroup, setStudentGroup] = useState(false);
  const [studentGroupSize, setStudentGroupSize] = useState(2);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => setPreviewMode(!h.supabase));
  }, []);

  const isRecurring = recurringDay !== "";

  const estimate = useMemo(
    () =>
      calculateLaunchTotal(LAUNCH_PRICING, {
        serviceType,
        loadCount,
        city,
        returnMethod,
        recurring: isRecurring,
        seniorOrVeteran,
        studentGroupSize: studentGroup ? studentGroupSize : 0,
        addons: { soap: addonSoap, dryerSheets: addonDryerSheets, rush: addonRush },
      }),
    [
      serviceType,
      loadCount,
      city,
      returnMethod,
      isRecurring,
      seniorOrVeteran,
      studentGroup,
      studentGroupSize,
      addonSoap,
      addonDryerSheets,
      addonRush,
    ]
  );

  const zone = getServiceZone(city);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const [pickupStart, pickupEnd] = timeWindow.split("-");

    const payload = {
      street,
      city,
      zip,
      pickupDate,
      pickupWindowStart: pickupStart,
      pickupWindowEnd: pickupEnd,
      returnMethod,
      recurringDay: recurringDay ? parseInt(recurringDay) : null,
      loadCount,
      serviceType,
      addonSoap,
      addonDryerSheets,
      addonRush,
      customerNotes: notes,
      seniorOrVeteran,
      studentGroupSize: studentGroup ? studentGroupSize : 0,
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.status === 503 && data.preview) {
      const saved = savePreviewOrder({
        serviceType,
        loadCount,
        street,
        city,
        zip,
        pickupDate,
        pickupWindowStart: pickupStart,
        pickupWindowEnd: pickupEnd,
        returnMethod,
        recurring: isRecurring,
        customerEmail,
        customerPhone,
        customerNotes: notes,
        totalCents: estimate.totalCents,
        addonSoap,
        addonDryerSheets,
        addonRush,
      });
      router.push(`/book/orders/local/${saved.id}`);
      return;
    }

    if (!res.ok) {
      if (res.status === 401) {
        setError("Please log in to complete your booking, or continue in preview mode.");
        setLoading(false);
        return;
      }
      setError(data.error || "Failed to create order");
      setLoading(false);
      return;
    }

    router.push(`/book/orders/${data.orderId}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-fog">
      <SiteHeader />
      <main className="flex-1 mx-auto w-full max-w-lg px-5 py-8">
        <div className="mb-6">
          <p className="text-sm font-medium text-ocean uppercase tracking-wider">New order</p>
          <h1 className="font-display text-2xl font-semibold text-charcoal mt-1">Book a pickup</h1>
          <p className="text-sm text-slate mt-1">
            Serving Arcata, Eureka, Loleta &amp; Fields Landing. Pickup days flex with demand.
          </p>
        </div>
        {previewMode ? (
          <div className="mb-4 rounded-xl bg-mist border border-foam px-4 py-3 text-sm text-slate">
            Preview mode — your booking saves on this device. Add email or phone so we can confirm pickup.
          </div>
        ) : null}
        <Card variant="elevated">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {previewMode ? (
              <>
                <Input label="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@email.com" />
                <Input label="Phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="707-555-1234" hint="Helpful for seniors — we'll call to confirm pickup" />
              </>
            ) : null}
            <Select
              label="Service type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
              options={SERVICE_OPTIONS}
            />
            <Input label="Street address" required value={street} onChange={(e) => setStreet(e.target.value)} />
            <Select
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={LAUNCH_CITIES.map((c) => ({ value: c, label: c }))}
            />
            {zone === "extended" ? (
              <p className="text-sm text-slate -mt-4">
                +{formatCents(toListPriceCents(LAUNCH_PRICING.extendedZoneSurchargeCents))} distance fee for Loleta area.
              </p>
            ) : null}
            <Input label="ZIP code" required value={zip} onChange={(e) => setZip(e.target.value)} maxLength={5} placeholder="95521" />
            <Input label="Number of loads" type="number" min={1} max={6} value={loadCount} onChange={(e) => setLoadCount(parseInt(e.target.value) || 1)} hint="One load ≈ one washer full of laundry" />
            <Input label="Pickup date" type="date" required value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
            <Select label="Pickup window" value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} options={TIME_WINDOWS} />
            <Select label="Repeat" value={recurringDay} onChange={(e) => setRecurringDay(e.target.value)} options={RECURRING_DAYS} />
            {isRecurring ? (
              <p className="text-sm text-ocean -mt-4">10% recurring discount applied</p>
            ) : null}
            <Select
              label="Return method"
              value={returnMethod}
              onChange={(e) => setReturnMethod(e.target.value as "driver_delivery" | "customer_pickup")}
              options={[
                { value: "driver_delivery", label: "Deliver back to me" },
                { value: "customer_pickup", label: "I'll pick up clean laundry (−$4)" },
              ]}
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-charcoal">Discounts</p>
              <Checkbox
                label="Senior or veteran (5% off)"
                checked={seniorOrVeteran}
                onChange={(e) => setSeniorOrVeteran(e.target.checked)}
              />
              <Checkbox
                label="Student group booking (2+ people)"
                checked={studentGroup}
                onChange={(e) => setStudentGroup(e.target.checked)}
              />
              {studentGroup ? (
                <Input
                  label="People in your group"
                  type="number"
                  min={2}
                  max={10}
                  value={studentGroupSize}
                  onChange={(e) => setStudentGroupSize(Math.max(2, parseInt(e.target.value) || 2))}
                  hint={`${getStudentGroupDiscountPercent(studentGroupSize) * 100}% group discount applied`}
                />
              ) : null}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-charcoal">Add-ons</p>
              <Checkbox label="We provide soap (+$2)" checked={addonSoap} onChange={(e) => setAddonSoap(e.target.checked)} />
              <Checkbox label="We provide dryer sheets (+$1.50)" checked={addonDryerSheets} onChange={(e) => setAddonDryerSheets(e.target.checked)} />
              <Checkbox label="Rush / same-day (+$8)" checked={addonRush} onChange={(e) => setAddonRush(e.target.checked)} />
            </div>
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Gate code, sensitive items, detergent preferences…" />
            <div className="rounded-xl bg-mist border border-foam p-5">
              <p className="text-sm text-slate">Estimated total</p>
              <p className="text-3xl font-display font-semibold text-ocean mt-1">
                ${(estimate.totalCents / 100).toFixed(2)}
              </p>
              <p className="text-xs text-slate mt-2">
                {formatCents(toListPriceCents(LAUNCH_PRICING.minimumOrderCents))} minimum · laundromat costs included
              </p>
            </div>
            {error ? <p className="text-sm text-[#B85C5C]">{error}</p> : null}
            <Button type="submit" fullWidth loading={loading} size="lg">
              Confirm pickup
            </Button>
          </form>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}
