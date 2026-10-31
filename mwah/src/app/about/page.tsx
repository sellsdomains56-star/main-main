import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Our story" };
// SAMPLE COPY: replace with your real story and keep it factual (where you make the balms, who makes them, why you started).
export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-6xl font-extrabold">Lip balm, <span className="text-pink">made to be enjoyed.</span></h1>
      <div className="mt-8 space-y-5 text-lg">
        <p>Mwah is a lip balm brand based in the UAE. We believe a balm should feel good, taste good and be something you actually look forward to reaching for.</p>
        <p>Every flavour is built around a soft, comfortable balm base and finished with a glossy shine, in a pocket-size tube that goes everywhere with you.</p>
        <p>We ship from the UAE to the whole GCC and to customers around the world, so wherever you are, you can get your mwah.</p>
      </div>
      <Link href="/shop" className="btn btn-pink mt-8">Find your flavour</Link>
    </div>
  );
}
