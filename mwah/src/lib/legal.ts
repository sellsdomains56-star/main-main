import type { LegalInfo } from "./types";

/** Bump when the policy wording changes. It is stored on every order as proof of what the customer accepted. */
export const POLICY_VERSION = "2026-11-01";
export const POLICY_DATE = "1 November 2026";

export const LEGAL_FIELDS: [keyof LegalInfo, string][] = [
  ["legalName", "Registered company name"], ["tradeLicenceNo", "Trade licence number"], ["licensingAuthority", "Licensing authority"],
  ["vatTrn", "VAT registration number (TRN)"], ["address", "Registered address"], ["email", "Customer support email"], ["phone", "Phone number"],
];
export const missingLegal = (l: LegalInfo) => LEGAL_FIELDS.filter(([k]) => !l[k].trim()).map(([, label]) => label);
