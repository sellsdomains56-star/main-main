"use client";
// Filters the table rows in place. The inputs stay in the form, so hidden rows are still saved.
export function TaxFilter() {
  return (
    <div><label className="label" htmlFor="taxfind">Find a country</label>
      <input id="taxfind" className="input max-w-sm" placeholder="Type a country…" onChange={(e) => {
        const q = e.target.value.trim().toLowerCase();
        document.querySelectorAll<HTMLTableRowElement>("#taxtable tbody tr").forEach((tr) => { tr.hidden = q !== "" && !(tr.dataset.name ?? "").includes(q); });
      }} /></div>
  );
}
