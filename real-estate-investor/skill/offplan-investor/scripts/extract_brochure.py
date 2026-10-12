#!/usr/bin/env python3
"""Extract text and candidate deal fields from an off-plan brochure PDF."""
import json, re, shutil, subprocess, sys

def pdf_text(path):
    try:
        from pypdf import PdfReader
        return "\n".join((p.extract_text() or "") for p in PdfReader(path).pages)
    except ImportError:
        if shutil.which("pdftotext"):
            return subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True, text=True).stdout
        sys.exit("Install pypdf (pip install pypdf) or poppler-utils (pdftotext).")

def first(pattern, text, flags=re.I):
    m = re.search(pattern, text, flags)
    return m.group(1).strip() if m else None

def num(s):
    return float(s.replace(",", "")) if s else None

def fields(t):
    return {
        "price_aed": num(first(r"(?:AED|Dhs?\.?)\s*([\d,]{6,})", t)),
        "size_sqft": num(first(r"([\d,]{3,6}(?:\.\d+)?)\s*(?:sq\.?\s*ft|sqft|square feet)", t)),
        "handover": first(r"handover[^\n]{0,40}?((?:Q[1-4]\s*)?(?:20\d\d))", t),
        "payment_percentages": re.findall(r"(\d{1,3})\s*%", t)[:12],
        "service_charge_per_sqft": num(first(r"service charge[^\n]{0,40}?([\d.]+)\s*(?:AED|Dhs?)?\s*/?\s*(?:per\s*)?sq", t)),
        "developer": first(r"(?:developer|developed by)\s*[:\-]?\s*([^\n]{3,60})", t),
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: extract_brochure.py file.pdf")
    text = pdf_text(sys.argv[1])
    if len(text.strip()) < 50:
        print("WARNING: no text found; the PDF is probably scanned. OCR needed.", file=sys.stderr)
    print("=== FIELDS (verify each) ===")
    print(json.dumps(fields(text), indent=2))
    print("=== TEXT ===")
    print(text)
