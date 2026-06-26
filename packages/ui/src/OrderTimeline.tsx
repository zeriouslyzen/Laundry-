import type { OrderEvent, OrderStatus } from "@humboldt/db";
import { ORDER_STATUS_LABELS } from "@humboldt/db";

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending_match",
  "finding_driver",
  "driver_assigned",
  "en_route_pickup",
  "picked_up",
  "washing",
  "ready",
  "en_route_return",
  "awaiting_customer_pickup",
];

interface OrderTimelineProps {
  events: OrderEvent[];
  currentStatus: OrderStatus;
}

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const displayEvents =
    events.length > 0
      ? events
      : [{ id: "current", status: currentStatus, created_at: new Date().toISOString(), order_id: "", note: null, actor_id: null, lat: null, lng: null }];

  return (
    <ol className="relative border-l-2 border-foam ml-3 space-y-7">
      {displayEvents.map((event, i) => {
        const isLatest = i === displayEvents.length - 1;
        const isActive = ACTIVE_STATUSES.includes(event.status) && isLatest;
        return (
          <li key={event.id} className="ml-7">
            <span
              className={[
                "absolute -left-[5px] flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4 ring-fog",
                isActive ? "bg-ocean scale-125" : "bg-sky/60",
              ].join(" ")}
            />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-charcoal">
                {ORDER_STATUS_LABELS[event.status]}
              </span>
              <time className="text-xs text-slate">
                {new Date(event.created_at).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </time>
              {event.note ? (
                <p className="text-sm text-slate mt-1">{event.note}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
