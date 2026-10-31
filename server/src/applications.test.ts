import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";

// The team's email must be known before the config loads.
process.env.ADMIN_EMAILS = "lead@alwaysfresh.app";
const { createApp } = await import("./app.js");
const { needsApplication } = await import("./routes/applications.js");

let base = "";
const server = createApp().listen(0);
before(() => {
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

async function call(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const res = await fetch(base + path, {
    method: init.method ?? (init.body ? "POST" : "GET"),
    headers: { "content-type": "application/json", ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  return { status: res.status, json: res.status === 204 ? null : await res.json() };
}
const upload = (token: string, kind: string, type = "image/jpeg") =>
  fetch(`${base}/barbers/me/application/documents/${kind}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": type }, body: new Uint8Array(3000).fill(7) });

test("freelance barbers apply with their Emirates ID, licence and the signed agreement; the team approves", async () => {
  const lead = (await call("/auth/register", { body: { name: "Team Lead", email: "lead@alwaysfresh.app", password: "password123" } })).json;
  await call("/admin/settings", { method: "PATCH", token: lead.token, body: { reviewNewBarbers: true } });
  const acc = (await call("/auth/register-barber", {
    body: { name: "Faisal Freelance", email: "faisal@example.com", password: "password123", countryCode: "AE", city: "Dubai", shopAddress: "Al Barsha 1", haircutPrice: 7000 },
  })).json;
  const id = acc.user.barberId;
  const token = acc.token;

  // A fresh application: everything still to do, and the agreement with Always Fresh's fee filled in.
  const start = (await call("/barbers/me/application", { token })).json;
  assert.equal(start.status, "draft");
  assert.equal(start.required, true);
  assert.equal(start.idLabel, "Emirates ID");
  assert.ok(start.missing.length >= 8);
  assert.ok(start.agreement.sections.some((s: { body: string }) => s.body.includes("10%")));
  assert.equal((await call("/barbers/me/business", { token })).json.application.status, "draft");
  assert.equal((await call("/barbers/me/application/submit", { token, method: "POST" })).status, 400);

  // Emirates ID numbers are checked and tidied; expired documents can't be sent.
  assert.equal((await call("/barbers/me/application", { method: "PATCH", token, body: { idNumber: "12345" } })).status, 400);
  const details = await call("/barbers/me/application", { method: "PATCH", token, body: { legalName: "Faisal Ahmed Freelance", idNumber: "784 1990 1234567 1", idExpiry: "2020-01-31", licenceNumber: "BL-77", licenceAuthority: "Dubai Municipality", licenceExpiry: "2031-03-31" } });
  assert.equal(details.json.idNumber, "784-1990-1234567-1");
  assert.ok(details.json.missing.some((m: string) => m.includes("expired")));
  await call("/barbers/me/application", { method: "PATCH", token, body: { idExpiry: "2031-03-31" } });

  // Documents: photos or PDFs only, kept private behind short-lived signed links.
  assert.equal((await upload(token, "id_front", "text/plain")).status, 400);
  assert.equal((await upload(token, "passport")).status, 400);
  assert.equal((await upload(token, "id_front")).status, 201);
  assert.equal((await upload(token, "id_back")).status, 201);
  const withDocs = await (await upload(token, "licence", "application/pdf")).json();
  const link: string = withDocs.docs.id_front.url;
  assert.match(link, /^\/private\/[\w-]+\.jpg\?exp=\d+&sig=[0-9a-f]+$/);
  assert.equal((await fetch(base + link)).status, 200);
  assert.equal((await fetch(base + link.replace(/sig=./, "sig=0"))).status, 403);
  assert.equal((await fetch(base + link.replace(/exp=\d+/, "exp=1000"))).status, 403);
  assert.equal((await fetch(base + "/uploads/" + link.split("/")[2]!.split("?")[0])).status, 404); // never public
  assert.equal(withDocs.docs.licence.contentType, "application/pdf");

  // Signing: a drawn signature, the typed name and the tick.
  assert.equal((await call("/barbers/me/application/sign", { token, body: { name: "Faisal Ahmed Freelance", svg: "M10 10 L 200 80", agree: false } })).status, 400);
  const signed = (await call("/barbers/me/application/sign", { token, body: { name: "Faisal Ahmed Freelance", svg: "M10 10 C 40 80, 90 0, 120 50 L 280 60", agree: true } })).json;
  assert.equal(signed.signature.current, true);
  assert.deepEqual(signed.missing, []);

  // Sent: the team hears about it and the barber can't change it while it's checked.
  const sent = (await call("/barbers/me/application/submit", { token, method: "POST" })).json;
  assert.equal(sent.status, "submitted");
  assert.equal((await call("/barbers/me/application", { method: "PATCH", token, body: { licenceNumber: "X-1" } })).status, 409);
  const leadAlerts = (await call("/notifications", { token: lead.token })).json;
  assert.ok(leadAlerts.items.some((n: { title: string }) => n.title === "New barber application"));
  const queue = (await call("/admin/applications?status=submitted", { token: lead.token })).json;
  assert.ok(queue.some((r: { barberId: string; missing: number }) => r.barberId === id && r.missing === 0));
  assert.equal((await call(`/admin/barbers/${id}`, { method: "PATCH", token: lead.token, body: { status: "live" } })).status, 400);

  // Sent back with a reason, fixed, sent again.
  assert.equal((await call(`/admin/barbers/${id}/application/reject`, { token: lead.token, body: { reason: "no" } })).status, 400);
  const back = (await call(`/admin/barbers/${id}/application/reject`, { token: lead.token, body: { reason: "The licence photo is blurry. Please upload a sharper one." } })).json;
  assert.equal(back.status, "rejected");
  const alerts = (await call("/notifications", { token })).json;
  assert.ok(alerts.items.some((n: { title: string; body: string }) => n.title === "Your application needs a change" && n.body.includes("blurry")));
  assert.equal((await call("/barbers/me/application", { token })).json.rejectionReason, "The licence photo is blurry. Please upload a sharper one.");
  assert.equal((await upload(token, "licence")).status, 201);
  assert.equal((await call("/barbers/me/application/submit", { token, method: "POST" })).json.status, "submitted");

  // Approved: verified and live, and the team's view shows the signature's details.
  const ok = (await call(`/admin/barbers/${id}/application/approve`, { token: lead.token, method: "POST" })).json;
  assert.equal(ok.status, "approved");
  assert.equal(ok.reviewedBy, "lead@alwaysfresh.app");
  assert.ok(ok.signature.userAgent !== undefined);
  const detail = (await call(`/admin/barbers/${id}`, { token: lead.token })).json;
  assert.equal(detail.status, "live");
  assert.equal(detail.verified, true);
  assert.equal(detail.application.status, "approved");
  assert.equal((await call(`/barbers/${id}`)).status, 200);
  assert.ok((await call("/notifications", { token })).json.items.some((n: { title: string }) => n.title === "You're approved"));
  assert.equal((await call("/barbers/me/application/sign", { token, body: { name: "Faisal", svg: "M10 10 L 200 80", agree: true } })).status, 409);

  // Deleting the account deletes the documents.
  const docLink: string = (await call("/barbers/me/application", { token })).json.docs.id_back.url;
  assert.equal((await fetch(base + docLink)).status, 200);
  assert.equal((await call("/me", { method: "DELETE", token, body: { confirm: true } })).status, 204);
  assert.equal((await fetch(base + docLink)).status, 404);
  await call("/admin/settings", { method: "PATCH", token: lead.token, body: { reviewNewBarbers: false } });
});

test("only barbers apply, and barbers at a barbershop don't need to", async () => {
  const customer = (await call("/auth/register", { body: { name: "Cus Tomer", email: "cus@example.com", password: "password123" } })).json;
  assert.equal((await call("/barbers/me/application", { token: customer.token })).status, 403);
  assert.equal((await call("/barbers/me/application")).status, 401);
  assert.equal(needsApplication({ shopId: "s-dubai-marina" } as never), false);
  assert.equal(needsApplication({} as never), true);
  // Outside the UAE the ID is a passport, with no back side.
  const acc = (await call("/auth/register-barber", {
    body: { name: "Pierre Paris", email: "pierre@example.com", password: "password123", countryCode: "FR", city: "Paris", shopAddress: "Rue Oberkampf", haircutPrice: 3000 },
  })).json;
  const view = (await call("/barbers/me/application", { token: acc.token })).json;
  assert.equal(view.idLabel, "Passport");
  assert.ok(!view.missing.some((m: string) => m.includes("back")));
  assert.equal((await call("/barbers/me/application", { method: "PATCH", token: acc.token, body: { idNumber: "18av 12345" } })).json.idNumber, "18AV12345");
});
