import type { Metadata } from "next";
import { COUNTRIES } from "@/lib/countries";
import { Checkout } from "./Checkout";
export const metadata: Metadata = { title: "Checkout" };
export default function Page() { return <Checkout countries={COUNTRIES} />; }
