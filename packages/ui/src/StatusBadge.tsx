import type { OrderStatus } from "@humboldt/db";
import { ORDER_STATUS_LABELS } from "@humboldt/db";

const statusColors: Record<OrderStatus, string> = {
  pending_match: "bg-mist text-slate",
  finding_driver: "bg-driftwood/15 text-[#8B7349]",
  driver_assigned: "bg-ocean/12 text-ocean",
  en_route_pickup: "bg-ocean/12 text-ocean-dark",
  picked_up: "bg-sky/20 text-ocean",
  washing: "bg-sky/25 text-ocean-dark",
  ready: "bg-ocean/15 text-ocean",
  en_route_return: "bg-ocean/12 text-ocean-dark",
  awaiting_customer_pickup: "bg-driftwood/15 text-[#8B7349]",
  completed: "bg-ocean/10 text-ocean-dark",
  cancelled: "bg-[#C45C5C]/12 text-[#C45C5C]",
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
        statusColors[status],
        className,
      ].join(" ")}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
