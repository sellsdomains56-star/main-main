import type { Metadata } from "next";
import { ProductForm } from "../ProductForm";
export const metadata: Metadata = { title: "New product", robots: { index: false } };
export default function New() { return <div className="space-y-5"><h1 className="text-4xl font-extrabold">New product</h1><ProductForm /></div>; }
