"use client";

import { useState } from "react";
import { Button, Card, Input, Textarea } from "@humboldt/ui";

const STORAGE_KEY = "ncl_community_suggestions";

export function CommunitySuggestionsForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const entry = {
      id: `suggestion-${Date.now()}`,
      name: name.trim() || "Anonymous",
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      existing.unshift(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
    } catch {
      /* ignore */
    }

    await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).catch(() => {});

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <Card padding="md" className="text-center">
        <p className="font-semibold text-charcoal">Thank you!</p>
        <p className="mt-2 text-slate text-sm leading-relaxed">
          Your suggestion helps us serve Humboldt better. We read every message.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Input
          label="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <Input
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
        <Textarea
          label="Your suggestion"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Pickup days, service ideas, neighborhoods to add, feedback…"
        />
        <Button type="submit" loading={loading} fullWidth>
          Share suggestion
        </Button>
      </form>
    </Card>
  );
}
