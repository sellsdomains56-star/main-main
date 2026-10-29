import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productById } from "@/lib/store";
import { ProductForm } from "../ProductForm";
export const metadata: Metadata = { title: "Edit product", robots: { index: false } };
export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const p = await productById((await params).id); if (!p) notFound();
  return <div className="space-y-5"><h1 className="text-4xl font-extrabold">{p.name}</h1><ProductForm p={p} /></div>;
}
