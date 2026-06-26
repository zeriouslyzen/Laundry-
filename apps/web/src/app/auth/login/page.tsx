"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardTitle, Input } from "@humboldt/ui";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/book";
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  async function handlePhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const formattedPhone = phone.startsWith("+") ? phone : `+1${phone.replace(/\D/g, "")}`;

    if (!otpSent) {
      const { error: authError } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      setOtpSent(true);
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: "sms",
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-mist to-fog">
      <Card className="w-full max-w-md">
        <CardTitle>Sign in</CardTitle>
        <p className="text-sm text-slate mt-1">North Coast Laundry account</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant={mode === "email" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("email")}
          >
            Email
          </Button>
          <Button
            variant={mode === "phone" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setMode("phone")}
          >
            Phone
          </Button>
        </div>

        {mode === "email" ? (
          <form onSubmit={handleEmailLogin} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error ? <p className="text-sm text-[#B85C5C]">{error}</p> : null}
            <Button type="submit" fullWidth loading={loading}>
              Log in
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePhoneOtp} className="mt-6 flex flex-col gap-4">
            <Input
              label="Phone number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="7075551234"
              disabled={otpSent}
            />
            {otpSent ? (
              <Input
                label="Verification code"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
            ) : null}
            {error ? <p className="text-sm text-[#B85C5C]">{error}</p> : null}
            <Button type="submit" fullWidth loading={loading}>
              {otpSent ? "Verify code" : "Send code"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-[#5C6670]">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-[#4A6741] hover:underline">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
