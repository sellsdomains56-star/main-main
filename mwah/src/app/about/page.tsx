import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Our story" };
export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-6xl font-extrabold">Born in Dubai, <span className="text-pink">made for kissing.</span></h1>
      <div className="mt-8 space-y-5 text-lg">
        <p>Mwah started with one problem: lip balms that were either sticky, boring, or both. Desert heat, air-con and long days are rough on lips, so we made a balm that hydrates properly and feels like nothing.</p>
        <p>Every Mwah balm is packed with shea butter, jojoba oil and vitamin E, in flavours that make you smile when you reach for them.</p>
        <p>We make small batches in the UAE and ship around the world, so wherever you are, you can get your mwah.</p>
      </div>
      <Link href="/shop" className="btn btn-pink mt-8">Find your flavour</Link>
    </div>
  );
}
