"use client";

import { useState } from "react";
import { Button } from "@humboldt/ui";

export function LocationShareClient() {
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState("");

  function startSharing() {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }
    setSharing(true);
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        await fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        });
        setStatus("Location shared");
      },
      () => setStatus("Could not get location"),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }

  return (
    <div className="rounded-xl border border-[#E5E3DE] bg-white p-4">
      <p className="text-sm font-medium text-[#2C3338]">Share live location</p>
      <p className="text-xs text-[#5C6670] mt-1">Let customers see when you&apos;re en route</p>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={startSharing}
        disabled={sharing}
      >
        {sharing ? "Sharing..." : "Start sharing"}
      </Button>
      {status ? <p className="mt-2 text-xs text-[#4A6741]">{status}</p> : null}
    </div>
  );
}
