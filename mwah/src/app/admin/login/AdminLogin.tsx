"use client";
import { useActionState } from "react";
import { adminLogin } from "../actions";
export function AdminLogin() {
  const [st, action, pending] = useActionState(adminLogin, {} as { error?: string; email?: string });
  return (
    <form action={action} className="card mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-3xl font-extrabold">Mwah admin 🔒</h1>
      <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" defaultValue={st.email} className="input" /></div>
      <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" className="input" /></div>
      {st.error && <p role="alert" className="rounded-xl bg-red-100 p-3 text-sm font-bold text-red-800">{st.error}</p>}
      <button disabled={pending} className="btn btn-ink w-full">{pending ? "…" : "Log in"}</button>
    </form>
  );
}
