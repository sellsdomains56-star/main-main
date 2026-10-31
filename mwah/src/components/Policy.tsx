import { POLICY_DATE } from "@/lib/legal";

export function Policy({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-5xl font-extrabold md:text-6xl">{title}</h1>
      <p className="mt-3 text-sm">Last updated {POLICY_DATE}</p>
      {intro && <p className="mt-4 text-lg">{intro}</p>}
      <div className="policy mt-4">{children}</div>
    </article>
  );
}

/** A business detail from Admin → Settings. A missing one shows as a visible gap and fails the launch checklist. */
export function V({ v, label }: { v?: string; label: string }) {
  return v?.trim() ? <>{v}</> : <span className="todo">[{label}]</span>;
}
