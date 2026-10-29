import type { Metadata } from "next";
import { allInfluencers, influencerStats } from "@/lib/store";
import { fmt } from "@/lib/money";
import { setInfluencerStatus, updateInfluencer, recordPayout } from "../../actions";
import { ApproveButton } from "./ApproveButton";
export const metadata: Metadata = { title: "Creators", robots: { index: false } };

export default async function Influencers() {
  const all = await allInfluencers();
  const rows = await Promise.all(all.map(async (i) => ({ i, st: await influencerStats(i) })));
  const applied = rows.filter((r) => r.i.status === "applied");
  const rest = rows.filter((r) => r.i.status !== "applied");
  const owed = rest.reduce((t, r) => t + r.st.balance, 0);
  return (
    <div className="space-y-6">
      <div><h1 className="text-4xl font-extrabold">Creators</h1><p className="text-sm">Referral links exist only for creators you approve. Total owed to creators: <b>{fmt(owed)}</b></p></div>
      {applied.length > 0 && <section className="card p-5"><h2 className="text-lg font-extrabold">New applications ({applied.length})</h2>
        <ul className="mt-3 divide-y divide-blush">{applied.map(({ i }) => <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-bold">{i.name} <span className="font-normal">@{i.handle}</span></p><p className="text-sm">{i.platform} · {i.followers || "?"} followers · {i.email}</p></div>
          <div className="flex items-center gap-2"><ApproveButton id={i.id} /><form action={setInfluencerStatus.bind(null, i.id, "rejected")}><button className="btn btn-ghost px-4 py-2 text-sm">Reject</button></form></div></li>)}</ul></section>}
      <div className="space-y-4">{rest.map(({ i, st }) => (
        <section key={i.id} className="card space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xl font-extrabold">{i.name} <span className="text-base font-normal">@{i.handle}</span></p><p className="text-sm capitalize">{i.status} · {i.email}</p></div>
            <div className="flex gap-2">{i.status === "active" && <form action={setInfluencerStatus.bind(null, i.id, "paused")}><button className="btn btn-ghost px-3 py-1.5 text-sm">Pause</button></form>}
              {i.status !== "active" && <ApproveButton id={i.id} label={i.passwordHash ? "Reactivate & reset password" : "Approve"} />}</div></div>
          <div className="grid grid-cols-3 gap-2 text-sm md:grid-cols-6">{[["Clicks", st.clicks], ["Orders", st.orders], ["Sales", fmt(st.revenue)], ["Earned", fmt(st.earned)], ["Paid out", fmt(st.paidOut)], ["Owed", fmt(st.balance)]].map(([k, v]) => <div key={k} className="rounded-2xl bg-cream p-3"><p className="text-xs font-bold">{k}</p><p className="font-extrabold">{v}</p></div>)}</div>
          <div className="grid gap-4 md:grid-cols-2">
            <form action={updateInfluencer.bind(null, i.id)} className="flex flex-wrap items-end gap-2">
              <div><label className="label" htmlFor={`c${i.id}`}>Code</label><input id={`c${i.id}`} name="code" defaultValue={i.code} className="input w-32 uppercase" /></div>
              <div><label className="label" htmlFor={`m${i.id}`}>Commission %</label><input id={`m${i.id}`} name="commissionPct" type="number" step="0.5" defaultValue={i.commissionPct} className="input w-24" /></div>
              <div><label className="label" htmlFor={`d${i.id}`}>Fan discount %</label><input id={`d${i.id}`} name="customerDiscountPct" type="number" step="0.5" defaultValue={i.customerDiscountPct} className="input w-24" /></div>
              <button className="btn btn-ink px-4 py-2.5 text-sm">Save</button></form>
            <form action={recordPayout.bind(null, i.id)} className="flex flex-wrap items-end gap-2">
              <div><label className="label" htmlFor={`a${i.id}`}>Record payout (AED)</label><input id={`a${i.id}`} name="amount" type="number" step="0.01" min="0" defaultValue={st.balance > 0 ? st.balance : ""} className="input w-32" /></div>
              <div><label className="label" htmlFor={`n${i.id}`}>Note</label><input id={`n${i.id}`} name="note" placeholder="Bank transfer" className="input w-40" /></div>
              <button className="btn btn-pink px-4 py-2.5 text-sm">Mark paid</button></form>
          </div>
        </section>))}
        {rest.length === 0 && applied.length === 0 && <p className="card p-6 text-center">No creators yet. Share <b>/influencers</b> so they can apply.</p>}
      </div>
    </div>
  );
}
