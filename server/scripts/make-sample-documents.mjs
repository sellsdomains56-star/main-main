#!/usr/bin/env node
/**
 * Draws the sample documents the demo accounts' applications use (an ID card front and back and a barber
 * licence), clearly marked as samples, into server/media/samples/. Needs Playwright.
 *
 *   node server/scripts/make-sample-documents.mjs
 *   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node server/scripts/make-sample-documents.mjs
 */
import { mkdirSync } from "node:fs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");

const out = new URL("../media/samples/", import.meta.url);
mkdirSync(out, { recursive: true });

const base = `
  * { box-sizing: border-box; margin: 0; }
  body { font-family: Helvetica, Arial, sans-serif; color: #1d2430; }
  .mark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .mark span { transform: rotate(-24deg); font-size: 120px; font-weight: 800; letter-spacing: 12px; color: rgba(200, 30, 40, 0.16); }
  .note { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font-size: 15px; font-weight: 700; color: #b3202a; letter-spacing: 1px; }
`;
const card = (inner) => `<style>${base}
  .card { position: relative; width: 856px; height: 540px; border-radius: 28px; overflow: hidden; padding: 36px 40px;
    background: linear-gradient(135deg, #eef2f6 0%, #dfe7ee 55%, #e9eef3 100%); border: 2px solid #c9d3dc; }
  h1 { font-size: 26px; letter-spacing: 3px; } h2 { font-size: 15px; color: #5a6675; margin-top: 4px; letter-spacing: 2px; }
  .row { display: flex; gap: 34px; margin-top: 34px; }
  .photo { width: 170px; height: 210px; border-radius: 14px; background: #c3ccd6; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
  .head { width: 86px; height: 86px; border-radius: 50%; background: #9aa6b3; margin-bottom: 8px; }
  .body { width: 150px; height: 70px; border-radius: 75px 75px 0 0; background: #9aa6b3; }
  dl { display: grid; grid-template-columns: 170px 1fr; row-gap: 14px; font-size: 19px; } dt { color: #5a6675; } dd { font-weight: 700; }
</style><div class="card">${inner}<div class="mark"><span>SAMPLE</span></div><div class="note">SAMPLE FOR THE ALWAYS FRESH DEMO · NOT A REAL DOCUMENT</div></div>`;

const pages = {
  "sample-id-front.jpg": card(`
    <h1>IDENTITY CARD</h1><h2>SAMPLE DOCUMENT</h2>
    <div class="row"><div class="photo"><div><div class="head" style="margin-left:32px"></div><div class="body"></div></div></div>
      <dl><dt>Name</dt><dd>SAMPLE BARBER</dd><dt>ID number</dt><dd>784-1990-1234567-1</dd><dt>Nationality</dt><dd>Sample</dd><dt>Date of birth</dt><dd>01/01/1990</dd><dt>Expiry date</dt><dd>30/06/2028</dd></dl></div>`),
  "sample-id-back.jpg": card(`
    <h1>IDENTITY CARD · BACK</h1><h2>SAMPLE DOCUMENT</h2>
    <dl style="margin-top:34px"><dt>Card number</dt><dd>000000000</dd><dt>Occupation</dt><dd>Barber</dd><dt>Issuing place</dt><dd>Sample</dd></dl>
    <div style="margin-top:40px;height:90px;background:repeating-linear-gradient(90deg,#1d2430 0 3px,transparent 3px 7px,#1d2430 7px 8px,transparent 8px 13px)"></div>`),
  "sample-licence.jpg": `<style>${base}
    .doc { position: relative; width: 720px; height: 960px; padding: 64px 60px; background: #fbfaf6; border: 14px double #b9a77a; }
    h1 { font-size: 34px; text-align: center; letter-spacing: 2px; } h2 { font-size: 17px; text-align: center; color: #6b6450; margin-top: 10px; letter-spacing: 3px; }
    p { font-size: 19px; line-height: 1.6; margin-top: 46px; text-align: center; }
    dl { display: grid; grid-template-columns: 220px 1fr; row-gap: 18px; font-size: 19px; margin-top: 54px; } dt { color: #6b6450; } dd { font-weight: 700; }
    .seal { position: absolute; right: 70px; bottom: 120px; width: 130px; height: 130px; border-radius: 50%; border: 4px solid #b9a77a; display: flex; align-items: center; justify-content: center; color: #8f8058; font-weight: 800; font-size: 18px; }
  </style><div class="doc"><h1>BARBER LICENCE</h1><h2>SAMPLE DOCUMENT</h2>
    <p>This sample certifies that the holder is permitted to practise as a barber.</p>
    <dl><dt>Holder</dt><dd>SAMPLE BARBER</dd><dt>Licence number</dt><dd>BL-2026-004512</dd><dt>Issued by</dt><dd>Sample Licensing Authority</dd><dt>Valid until</dt><dd>30/09/2027</dd></dl>
    <div class="seal">SAMPLE</div><div class="mark"><span>SAMPLE</span></div><div class="note">SAMPLE FOR THE ALWAYS FRESH DEMO · NOT A REAL DOCUMENT</div></div>`,
};

const browser = await chromium.launch();
for (const [name, html] of Object.entries(pages)) {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;display:inline-block;background:#fff">${html}</body>`);
  const el = await page.$(".card, .doc");
  await el.screenshot({ path: new URL(name, out).pathname, type: "jpeg", quality: 80 });
  await page.close();
  console.log("wrote", name);
}
await browser.close();
