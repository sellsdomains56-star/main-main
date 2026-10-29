import type { OrderStatus } from "@/lib/types";
const C: Record<OrderStatus, string> = { pending: "bg-gray-200 text-gray-700", paid: "bg-butter text-ink", packed: "bg-lilac/60 text-ink", shipped: "bg-sky-200 text-sky-900", delivered: "bg-green-200 text-green-900", cancelled: "bg-red-200 text-red-900", refunded: "bg-red-100 text-red-800" };
export function StatusBadge({ s }: { s: OrderStatus }) { return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${C[s]}`}>{s}</span>; }
