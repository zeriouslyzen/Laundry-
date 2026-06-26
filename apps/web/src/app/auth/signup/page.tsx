"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, Input, Select } from "@humboldt/ui";
import { createClient } from "@/lib/supabase/client";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "driver" ? "driver" : "customer";
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(defaultRole);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (role === "driver" && data.user) {
      await supabase.from("driver_profiles").insert({ user_id: data.user.id });
      await supabase.from("profiles").update({ role: "driver" }).eq("id", data.user.id);
      router.push("/driver/onboarding");
    } else {
      router.push("/book");
    }
    router.refresh();
  }

  async function handlePhoneSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`;

    if (!otpSent) {
      const { error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: { data: { full_name: fullName, role } },
      });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setOtpSent(true);
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    if (role === "driver" && data.user) {
      await supabase.from("driver_profiles").insert({ user_id: data.user.id });
      await supabase.from("profiles").update({ role: "driver", full_name: fullName }).eq("id", data.user.id);
      router.push("/driver/onboarding");
    } else {
      router.push("/book");
    }
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardTitle>Create account</CardTitle>
      <p className="text-sm text-slate mt-1">North Coast Laundry</p>
      <div className="mt-4 flex gap-2">
        <Button variant={mode === "email" ? "primary" : "ghost"} size="sm" onClick={() => setMode("email")}>
          Email
        </Button>
        <Button variant={mode === "phone" ? "primary" : "ghost"} size="sm" onClick={() => setMode("phone")}>
          Phone
        </Button>
      </div>

      <div className="mt-4">
        <Select
          label="I am a"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "customer", label: "Customer — I need laundry picked up" },
            { value: "driver", label: "Driver — I want to earn washing laundry" },
          ]}
        />
      </div>

      {mode === "email" ? (
        <form onSubmit={handleEmailSignup} className="mt-4 flex flex-col gap-4">
          <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error ? <p className="text-sm text-[#B85C5C]">{error}</p> : null}
          <Button type="submit" fullWidth loading={loading}>Sign up</Button>
        </form>
      ) : (
        <form onSubmit={handlePhoneSignup} className="mt-4 flex flex-col gap-4">
          <Input label="Full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="7075551234" disabled={otpSent} />
          {otpSent ? <Input label="Verification code" required value={otp} onChange={(e) => setOtp(e.target.value)} /> : null}
          {error ? <p className="text-sm text-[#B85C5C]">{error}</p> : null}
          <Button type="submit" fullWidth loading={loading}>{otpSent ? "Verify" : "Send code"}</Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[#5C6670]">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#4A6741] hover:underline">Log in</Link>
      </p>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-mist to-fog">
      <Suspense>
        <SignupForm />
      </Suspense>
    </div>
  );
}
