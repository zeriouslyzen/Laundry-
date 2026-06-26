"use client";

import Image from "next/image";

interface OrderTrackingMapProps {
  driverLat: number;
  driverLng: number;
  customerLat?: number | null;
  customerLng?: number | null;
}

export function OrderTrackingMap({
  driverLat,
  driverLng,
  customerLat,
  customerLng,
}: OrderTrackingMapProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const centerLng = customerLng ?? driverLng;
  const centerLat = customerLat ?? driverLat;

  if (token) {
    const markers = `pin-s-car+2E5F8A(${driverLng},${driverLat})`;
    const customerMarker =
      customerLat && customerLng
        ? `,pin-s-home+4A8BB8(${customerLng},${customerLat})`
        : "";
    const mapUrl = `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${markers}${customerMarker}/${centerLng},${centerLat},12,0/600x300@2x?access_token=${token}`;

    return (
      <div className="overflow-hidden rounded-xl border border-[#E5E3DE]">
        <Image src={mapUrl} alt="Driver location map" width={600} height={300} className="w-full h-48 object-cover" unoptimized />
        <p className="px-4 py-2 text-xs text-[#5C6670] bg-white">
          Live driver location — updates when driver is en route
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E3DE] bg-[#EFEDE8] p-6 text-center">
      <p className="text-sm text-[#5C6670]">
        Driver location: {driverLat.toFixed(4)}, {driverLng.toFixed(4)}
      </p>
      <a
        href={`https://maps.google.com/?q=${driverLat},${driverLng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block text-sm text-ocean hover:text-ocean-dark hover:underline"
      >
        Open in Maps
      </a>
    </div>
  );
}
