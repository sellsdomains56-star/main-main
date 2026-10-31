import type { Metadata } from "next";
import { COUNTRIES } from "@/lib/countries";
import { getSettings } from "@/lib/store";
import { Checkout } from "./Checkout";
export const metadata: Metadata = { title: "Checkout" };
export default async function Page() {
  const { blockedCountries } = await getSettings();
  return <Checkout countries={COUNTRIES.filter(([c]) => !blockedCountries.includes(c))} />;
}
