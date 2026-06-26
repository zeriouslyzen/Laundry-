"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
  Card,
  CardTitle,
  Input,
  Select,
  Checkbox,
} from "@humboldt/ui";
import { createClient } from "@/lib/supabase/client";

const STEPS = [
  "Profile",
  "Washing setup",
  "Safety & rules",
  "Legal agreements",
  "Documents",
  "Review",
];

const SAFETY_RULES = [
  { id: "no_mixing", label: "I will never mix customer loads", description: "Each customer's laundry stays separate and labeled." },
  { id: "delicates", label: "I will follow customer notes for delicates and stains", description: "" },
  { id: "consent", label: "I will not pick up unattended laundry without customer consent", description: "" },
  { id: "vehicle", label: "I keep my vehicle clean and use sealed bags in transit", description: "" },
  { id: "privacy", label: "I will not photograph laundry contents beyond proof-of-pickup", description: "" },
  { id: "incidents", label: "I will report damage or lost items within 24 hours", description: "" },
  { id: "humboldt", label: "I understand Humboldt rural access challenges (long driveways, limited cell service)", description: "" },
];

export default function DriverOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);

  // Step 1 - Profile
  const [homeAddress, setHomeAddress] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState("08:00");
  const [availabilityEnd, setAvailabilityEnd] = useState("20:00");

  // Step 2 - Washing
  const [washLocation, setWashLocation] = useState("home_machines");
  const [maxLoads, setMaxLoads] = useState(3);
  const [turnaround, setTurnaround] = useState("24h");
  const [providesSoap, setProvidesSoap] = useState(false);
  const [providesDryerSheets, setProvidesDryerSheets] = useState(false);
  const [providesHypoallergenic, setProvidesHypoallergenic] = useState(false);
  const [providesFold, setProvidesFold] = useState(true);

  // Step 3 - Rules
  const [rulesAccepted, setRulesAccepted] = useState<Record<string, boolean>>({});

  // Step 4 - Legal
  const [contractorAccepted, setContractorAccepted] = useState(false);
  const [insuranceAccepted, setInsuranceAccepted] = useState(false);
  const [backgroundConsent, setBackgroundConsent] = useState(false);

  // Step 5 - Documents
  const [idFile, setIdFile] = useState<File | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("driver_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setDriverId(data.id);
        setStep(data.onboarding_step || 0);
      }
    }
    load();
  }, []);

  async function saveStep(nextStep: number) {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates: Record<string, unknown> = { onboarding_step: nextStep };

    if (step === 0) {
      Object.assign(updates, {
        home_address: homeAddress,
        availability_start: availabilityStart,
        availability_end: availabilityEnd,
      });
    } else if (step === 1) {
      Object.assign(updates, {
        wash_location: washLocation,
        max_loads_per_day: maxLoads,
        turnaround,
        provides_soap: providesSoap,
        provides_dryer_sheets: providesDryerSheets,
        provides_hypoallergenic: providesHypoallergenic,
        provides_fold: providesFold,
      });
    } else if (step === 2) {
      updates.rules_accepted_at = new Date().toISOString();
    } else if (step === 3) {
      updates.contractor_agreement_at = new Date().toISOString();
      updates.background_check_consent_at = new Date().toISOString();
    }

    await supabase.from("driver_profiles").update(updates).eq("user_id", user.id);

    if (step === 4 && idFile && driverId) {
      const path = `${user.id}/id-${Date.now()}`;
      await supabase.storage.from("driver-documents").upload(path, idFile);
      await supabase.from("driver_documents").insert({
        driver_id: driverId,
        doc_type: "government_id",
        storage_path: path,
      });
    }

    if (nextStep >= 6) {
      await supabase.from("driver_profiles").update({ onboarding_step: 6 }).eq("user_id", user.id);
      router.push("/driver");
      router.refresh();
      return;
    }

    setStep(nextStep);
    setLoading(false);
  }

  const allRulesAccepted = SAFETY_RULES.every((r) => rulesAccepted[r.id]);

  return (
    <div className="min-h-screen bg-[#F7F6F3] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <Link href="/driver" className="text-sm text-[#4A6741] hover:underline">← Back</Link>
        <div className="mt-4 flex gap-1">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#4A6741]" : "bg-[#E5E3DE]"}`}
            />
          ))}
        </div>
        <Card className="mt-6">
          <CardTitle>{STEPS[step]}</CardTitle>

          {step === 0 && (
            <div className="mt-4 space-y-4">
              <Input label="Home base address" required value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} hint="Used to match you with nearby pickups" />
              <Input label="Available from" type="time" value={availabilityStart} onChange={(e) => setAvailabilityStart(e.target.value)} />
              <Input label="Available until" type="time" value={availabilityEnd} onChange={(e) => setAvailabilityEnd(e.target.value)} />
            </div>
          )}

          {step === 1 && (
            <div className="mt-4 space-y-4">
              <Select label="Where do you wash?" value={washLocation} onChange={(e) => setWashLocation(e.target.value)} options={[
                { value: "home_machines", label: "My home machines" },
                { value: "laundromat", label: "Partner laundromat" },
                { value: "both", label: "Both" },
              ]} />
              <Input label="Max loads per day" type="number" min={1} max={10} value={maxLoads} onChange={(e) => setMaxLoads(parseInt(e.target.value))} />
              <Select label="Typical turnaround" value={turnaround} onChange={(e) => setTurnaround(e.target.value)} options={[
                { value: "same_day", label: "Same day" },
                { value: "24h", label: "24 hours" },
                { value: "48h", label: "48 hours" },
              ]} />
              <div className="space-y-2">
                <p className="text-sm font-medium">Supplies you can provide</p>
                <Checkbox label="Soap" checked={providesSoap} onChange={(e) => setProvidesSoap(e.target.checked)} />
                <Checkbox label="Dryer sheets" checked={providesDryerSheets} onChange={(e) => setProvidesDryerSheets(e.target.checked)} />
                <Checkbox label="Hypoallergenic detergent" checked={providesHypoallergenic} onChange={(e) => setProvidesHypoallergenic(e.target.checked)} />
                <Checkbox label="Folding service" checked={providesFold} onChange={(e) => setProvidesFold(e.target.checked)} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-4 space-y-4">
              {SAFETY_RULES.map((rule) => (
                <Checkbox
                  key={rule.id}
                  label={rule.label}
                  description={rule.description}
                  checked={!!rulesAccepted[rule.id]}
                  onChange={(e) => setRulesAccepted({ ...rulesAccepted, [rule.id]: e.target.checked })}
                />
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="mt-4 space-y-4">
              <Checkbox label="I agree to the Independent Contractor Agreement" checked={contractorAccepted} onChange={(e) => setContractorAccepted(e.target.checked)} />
              <Checkbox label="I acknowledge liability and insurance requirements (personal auto + renters/home liability)" checked={insuranceAccepted} onChange={(e) => setInsuranceAccepted(e.target.checked)} />
              <Checkbox label="I consent to a background check" checked={backgroundConsent} onChange={(e) => setBackgroundConsent(e.target.checked)} />
              <Link href="/docs/contractor-agreement" className="text-sm text-[#4A6741] hover:underline block">
                Read full contractor agreement →
              </Link>
            </div>
          )}

          {step === 4 && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#2C3338]">Government ID</label>
                <input type="file" accept="image/*,.pdf" className="mt-2 block w-full text-sm" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} />
              </div>
              <p className="text-xs text-[#5C6670]">Optional: insurance proof, laundromat partnership letter can be uploaded after approval.</p>
            </div>
          )}

          {step === 5 && (
            <div className="mt-4 space-y-2 text-sm text-[#5C6670]">
              <p>Review your application before submitting:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Home base: {homeAddress || "—"}</li>
                <li>Wash location: {washLocation}</li>
                <li>Max loads/day: {maxLoads}</li>
                <li>Turnaround: {turnaround}</li>
              </ul>
              <p className="mt-4">After submission, our team will review and approve your application.</p>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            {step > 0 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
            ) : null}
            <Button
              fullWidth
              loading={loading}
              disabled={
                (step === 2 && !allRulesAccepted) ||
                (step === 3 && (!contractorAccepted || !insuranceAccepted || !backgroundConsent)) ||
                (step === 0 && !homeAddress)
              }
              onClick={() => saveStep(step + 1)}
            >
              {step === 5 ? "Submit application" : "Continue"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
