"use client";
export function PrintButton() {
  return <button onClick={() => window.print()} className="btn btn-ghost px-4 py-2 text-sm print:hidden">Print or save as PDF</button>;
}
