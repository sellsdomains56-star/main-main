import type { Metadata } from "next";
import { AdminLogin } from "./AdminLogin";
export const metadata: Metadata = { title: "Admin login", robots: { index: false } };
export default function Page() { return <div className="px-4 py-20"><AdminLogin /></div>; }
