import type { Product } from "@/lib/types";
import { BalmTube } from "./BalmTube";

export function ProductImage({ p, className = "" }: { p: Pick<Product, "images" | "color" | "color2" | "name">; className?: string }) {
  if (p.images[0]) return /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.images[0]} alt={p.name} className={`object-cover ${className}`} />;
  return (
    <div className={`flex items-center justify-center ${className}`} style={{ background: `radial-gradient(circle at 30% 20%, ${p.color2}, ${p.color2}88 60%, #fff6)` }}>
      <BalmTube color={p.color} color2={p.color2} className="h-[78%] drop-shadow-xl" />
    </div>
  );
}
