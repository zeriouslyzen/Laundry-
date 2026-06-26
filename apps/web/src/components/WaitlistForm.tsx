"use client";

import { useState } from "react";
import { Button, Input } from "@humboldt/ui";
import { createClient } from "@/lib/supabase/client";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [zip, setZip] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({ email, zip, type: "customer" });
    if (error) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
    setZip("");
  }

  if (status === "success") {
    return (
      <div className="rounded-xl bg-white border border-foam p-6 text-center">
        <p className="text-ocean font-semibold">You&apos;re on the list.</p>
        <p className="text-sm text-slate mt-1">We&apos;ll contact you when service is available in your area.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-white border border-foam p-6 shadow-sm">
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
      />
      <Input
        label="ZIP code"
        required
        value={zip}
        onChange={(e) => setZip(e.target.value)}
        placeholder="95521"
        maxLength={5}
      />
      <Button type="submit" fullWidth loading={status === "loading"}>
        Join waitlist
      </Button>
      {status === "error" ? (
        <p className="text-sm text-[#C45C5C] text-center">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}
