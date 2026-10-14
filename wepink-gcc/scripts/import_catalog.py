#!/usr/bin/env python3
"""Import the wepink Brazil catalogue into the Gulf store.

wepink.com.br runs on VTEX, whose public catalogue API lists every product
with its photos, descriptions and specifications. This script turns that into
the Gulf store's catalogue in three steps:

  python3 scripts/import_catalog.py fetch RAW_DIR   # download the catalogue JSON
  python3 scripts/import_catalog.py build RAW_DIR   # normalise, download photos,
                                                    # write data/catalog-source.json
  python3 scripts/import_catalog.py update RAW_DIR  # later runs: add products new on
                                                    # wepink.com.br, keep the rest, refresh
                                                    # badges and the best-seller ranking
  python3 scripts/import_catalog.py details         # each product page's full details
                                                    # (highlights, notes, ingredients, how to
                                                    # use) -> data/details-source.json
  python3 scripts/import_catalog.py js              # merge data/translations.json
                                                    # into assets/js/catalog.js

English, Arabic and Portuguese copy lives in data/translations.json (keyed by
product id; scent notes are [English, Arabic, Portuguese]), so re-running the
import keeps the translations. GCC prices are placeholders
by product type; set the real ones with the franchise.
"""
import concurrent.futures
import gzip
import html
import io
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://www.wepink.com.br/api/catalog_system/pub/products/search?_from={}&_to={}"
TOP = API + "&O=OrderByTopSaleDESC"  # the same catalogue, best sellers first
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
PHOTO_DIR = os.path.join(ROOT, "assets", "products")
SOURCE = os.path.join(ROOT, "data", "catalog-source.json")
TRANSLATIONS = os.path.join(ROOT, "data", "translations.json")
CATALOG_JS = os.path.join(ROOT, "assets", "js", "catalog.js")

# Intimate-wellness products (the "Wehot" line) are left out: they are
# restricted or prohibited in several GCC markets.
EXCLUDE_CATEGORY = ("/wehot/",)

FAMILY = {
    "gourmand": "sweet",
    "frutado": "floral",
    "floral": "floral",
    "oriental": "warm",
    "floriental": "warm",
    "âmbar": "warm",
    "amadeirado": "woody",
    "fougère": "woody",
    "chypre": "woody",
    "aromático": "woody",
    "cítrico": "fresh",
}

# Placeholder GCC prices in AED by product type.
PRICE_BY_TYPE = {
    "splash": 79, "cream": 69, "lotion": 89, "hairmist": 69, "bodyoil": 89,
    "scrub": 99, "butter": 89, "shower": 59, "soap": 29, "rollon": 39,
}

FRAGRANCE_TYPES = {"colonia", "splash", "cream", "lotion", "hairmist", "bodyoil", "scrub", "butter", "shower", "soap", "rollon"}


def get(url, binary=False):
    url = urllib.parse.quote(url, safe=":/?&=%-_.~,")
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    if data[:2] == b"\x1f\x8b":  # product pages come gzipped even unasked
        data = gzip.decompress(data)
    return data if binary else data.decode("utf-8")


def fetch(raw_dir):
    os.makedirs(raw_dir, exist_ok=True)
    page = 0
    while True:
        items = json.loads(get(API.format(page * 50, page * 50 + 49)))
        if not items:
            break
        with open(os.path.join(raw_dir, f"p{page}.json"), "w") as f:
            json.dump(items, f)
        print(f"page {page}: {len(items)} products")
        page += 1
    # wepink Brasil's sales ranking: product ids, best seller first
    top, page = [], 0
    while True:
        items = json.loads(get(TOP.format(page * 50, page * 50 + 49)))
        if not items:
            break
        top += [p["productId"] for p in items if p["productId"] not in top]
        page += 1
    with open(os.path.join(raw_dir, "top.json"), "w") as f:
        json.dump(top, f)
    print(f"best-seller ranking: {len(top)} products")


def load_raw(raw_dir):
    prods, seen = [], set()
    for name in sorted(os.listdir(raw_dir), key=lambda n: (len(n), n)):
        if re.fullmatch(r"p\d+\.json", name):
            for p in json.load(open(os.path.join(raw_dir, name))):
                if p["productId"] not in seen:
                    seen.add(p["productId"])
                    prods.append(p)
    return prods


def clean_name(name):
    name = re.sub(r"\s*[-–]\s*Wepink\s*$", "", name.strip())
    name = re.sub(r"\s+Wehot$", "", name)
    return re.sub(r"\s+", " ", name).strip()


def size_of(name):
    m = re.findall(r"(\d+(?:[.,]\d+)?)\s?(ml|mL|g)\b", name)
    if not m:
        return ""
    num, unit = m[-1]
    return f"{num.replace(',', '.')} {unit.lower()}"


def type_of(name, cat):
    n = name.lower()
    if n.startswith("body splash"):
        return "splash"
    if n.startswith("hair mist"):
        return "hairmist"
    if "roll-on" in n:
        return "rollon"
    if n.startswith("body cream"):
        return "cream"
    if n.startswith("the cream"):
        return "lotion"
    if n.startswith("the oil"):
        return "bodyoil"
    if n.startswith("body scrub"):
        return "scrub"
    if n.startswith("body butter"):
        return "butter"
    if "espuma de banho" in n:
        return "shower"
    if "sabonete" in n:
        return "skincare" if "facial" in n else "soap"
    if n.startswith("kit"):
        return "set"
    if "desodorante colônia" in n or "desodorante colonia" in n:
        return "colonia"
    if cat.startswith("/Make"):
        return "makeup"
    if cat.startswith("/skincare"):
        return "skincare"
    if cat.startswith("/Hair"):
        return "haircare"
    return "bodycare"


STRIP = [
    r"^Body Splash\s+", r"^Body Cream\s+", r"^Hair Mist\s+", r"^The Cream\s+", r"^The Oil\s+", r"^Body Scrub\s+",
    r"^Body Butter\s+", r"^Espuma de Banho\s+", r"^Sabonete em Barra\s+Clean Bar\s+",
    r"^Desodorante Antitranspirante Roll-on MyProtection\s+",
    r"\s*Desodorante (Colônia|Colonia|Hidratante|Capilar)\b", r"\s*(Loção|Óleo|Esfoliante|Manteiga) Corporal\b",
    r"\s*\d+(?:[.,]\d+)?\s?(ml|mL|g)?\s*$",
]


def line_of(name, ptype):
    if ptype not in FRAGRANCE_TYPES:
        return re.sub(r"\s*\d+(?:[.,]\d+)?\s?(ml|mL|g)\s*$", "", name).strip()
    line = name
    for pat in STRIP:
        line = re.sub(pat, "", line).strip()
    if ptype == "lotion" and not line:
        line = "The Cream"
    if ptype == "shower":
        line = re.sub(r"^Shower Dream\s+", "", line)
    return line or name


def category_of(ptype, cat, gender):
    if ptype == "set":
        return "gift-sets"
    men = "masculino" in cat.lower() or gender == "masculino"
    if men and ptype in FRAGRANCE_TYPES:
        return "men"
    if ptype == "colonia":
        return "perfume"
    if ptype == "splash":
        return "body-splash"
    if ptype in ("hairmist", "haircare"):
        return "hair"
    if ptype == "makeup":
        return "makeup"
    if ptype == "skincare":
        return "skincare"
    return "body-care"


def nice_price(aed):
    if aed < 20:
        return max(9, round(aed))
    return int(math.ceil(aed / 10.0) * 10 - 1)


def price_of(ptype, size, offer):
    if ptype in PRICE_BY_TYPE:
        return PRICE_BY_TYPE[ptype]
    if ptype == "colonia":
        ml = float(size.split()[0]) if size else 100
        return 189 if ml >= 75 else 149
    brl = offer["Price"] if offer.get("IsAvailable") else offer.get("ListPrice", offer["Price"]) * 0.45
    return nice_price(brl * 1.6)


def badge_of(p):
    clusters = set((p.get("productClusters") or {}).values())
    if "FLAG - lançamentos" in clusters:
        return "new"
    if "FLAG - best seller" in clusters:
        return "bestseller"
    if "FLAG - edição limitada" in clusters:
        return "limited"
    return None


def text_of(raw):
    t = re.sub(r"<br\s*/?>", "\n", raw or "", flags=re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t)
    return re.sub(r"[ \t]+", " ", re.sub(r"\n\s*", "\n", t)).strip()


def slug(s):
    s = s.lower()
    for a, b in (("áàâã", "a"), ("éê", "e"), ("í", "i"), ("óôõ", "o"), ("ú", "u"), ("ç", "c"), ("è", "e")):
        for ch in a:
            s = s.replace(ch, b)
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", s)).strip("-")


def resized(url, px):
    return re.sub(r"/ids/(\d+)(?:-\d+-\d+)?/", rf"/ids/\1-{px}-{px}/", url)


def tint(im):
    """Average colour of the product itself (ignoring the white backdrop)."""
    small = im.convert("RGB").resize((48, 48))
    picked = [px for px in list(small.getdata()) if (max(px) - min(px) > 28 or sum(px) < 450) and sum(px) < 700]
    if len(picked) < 20:
        return "#E6007E", "#FFE3EF"
    r, g, b = (sum(c[i] for c in picked) // len(picked) for i in range(3))
    color = f"#{r:02X}{g:02X}{b:02X}"
    light = tuple(int(c + (255 - c) * 0.78) for c in (r, g, b))
    return color, "#{:02X}{:02X}{:02X}".format(*light)


def save_photo(url, path):
    for attempt in range(4):
        try:
            data = get(resized(url, 600), binary=True)
            break
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == 3:
                raise
            time.sleep(2 ** attempt)
    im = Image.open(io.BytesIO(data))
    if im.mode in ("P", "RGBA", "LA"):
        im = im.convert("RGBA")
        bg = Image.new("RGB", im.size, "white")
        bg.paste(im, mask=im.split()[-1])
        im = bg
    im = im.convert("RGB")
    im.save(path, "WEBP", quality=80, method=6)
    return im


def normalise(p, ids):
    """One wepink.com.br product as a catalogue entry (no photos yet), or None if it's left out."""
    cat_raw = (p.get("categories") or ["/"])[0]
    if cat_raw.startswith(EXCLUDE_CATEGORY):
        return None
    item = p["items"][0]
    if not item.get("images"):
        return None
    name = clean_name(p["productName"])
    ptype = type_of(name, cat_raw)
    size = size_of(name)
    gender = ((p.get("gênero") or [None])[0]) or None
    fams = [re.sub(r"[^\wÀ-ÿ ]", "", f).strip() for f in (p.get("família olfativa") or [])]
    family = next((FAMILY[f] for f in fams if f in FAMILY), None)
    line = line_of(name, ptype)
    pid = slug(f"{ptype}-{line}-{size}")
    while pid in ids:
        pid += "-b"
    ids.add(pid)
    offer = item["sellers"][0]["commertialOffer"]
    return {
        "id": pid,
        "sourceId": p["productId"],
        "name_pt": name,
        "line": line,
        "type": ptype,
        "cat": category_of(ptype, cat_raw, gender),
        "size": size,
        "gender": gender,
        "family": family,
        "families_pt": fams,
        "badge": badge_of(p),
        "price": price_of(ptype, size, offer),
        "priceBRL": offer["Price"] if offer.get("IsAvailable") else None,
        "inStockBR": bool(offer.get("IsAvailable")),
        "short_pt": ((p.get("descricao_curta") or [""])[0] or "").strip(),
        "desc_pt": text_of(p.get("description")),
        "photos": [im["imageUrl"] for im in item["images"]],
        "link": "https://www.wepink.com.br/" + p["linkText"] + "/p",
    }


def with_photos(prod):
    """Download the first two photos (kept if already there) and take the colours from the first."""
    local = []
    for i, url in enumerate(prod["photos"][:2]):
        name = f"{prod['id']}{'' if i == 0 else '-' + str(i + 1)}.webp"
        path = os.path.join(PHOTO_DIR, name)
        try:
            im = Image.open(path) if os.path.exists(path) else save_photo(url, path)
            if i == 0:
                prod["color"], prod["color2"] = tint(im)
            local.append("assets/products/" + name)
        except Exception as e:  # keep going; the drawn bottle is the fallback
            print("photo failed", prod["id"], e)
    prod["images"] = local
    prod["remote"] = [resized(u, 800) for u in prod["photos"]]
    return prod


def ranking(raw_dir):
    path = os.path.join(raw_dir, "top.json")
    return {pid: i + 1 for i, pid in enumerate(json.load(open(path)))} if os.path.exists(path) else {}


def build(raw_dir):
    os.makedirs(PHOTO_DIR, exist_ok=True)
    out, ids = [], set()
    for p in load_raw(raw_dir):
        entry = normalise(p, ids)
        if entry:
            out.append(entry)
    rank = ranking(raw_dir)
    for prod in out:
        prod["rank"] = rank.get(prod["sourceId"])
    with concurrent.futures.ThreadPoolExecutor(16) as pool:
        out = list(pool.map(with_photos, out))
    os.makedirs(os.path.dirname(SOURCE), exist_ok=True)
    with open(SOURCE, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"{len(out)} products -> {SOURCE}")


def update(raw_dir):
    """Add products that are new on wepink.com.br and refresh badges and ranking;
    products already in the catalogue keep their id, price and photos, and ones
    wepink Brasil no longer lists stay (hide them in the admin panel if needed)."""
    os.makedirs(PHOTO_DIR, exist_ok=True)
    src = json.load(open(SOURCE))
    by_source = {p["sourceId"]: p for p in src}
    ids = {p["id"] for p in src}
    rank = ranking(raw_dir)
    added, badges = [], 0
    for p in load_raw(raw_dir):
        old = by_source.get(p["productId"])
        if old:
            b = badge_of(p)
            if b != old.get("badge"):
                old["badge"] = b
                badges += 1
            continue
        entry = normalise(p, ids)
        if entry:
            added.append(with_photos(entry))
    src += added
    for prod in src:
        prod["rank"] = rank.get(prod["sourceId"])
    with open(SOURCE, "w") as f:
        json.dump(src, f, ensure_ascii=False, indent=1)
    print(f"{len(added)} new products, {badges} badges changed -> {SOURCE}")
    for prod in added:
        print("  new:", prod["id"], "|", prod["name_pt"])


# ---- product page details -------------------------------------------------------------
# The VTEX API only carries the description; wepink.com.br's product pages add a
# "Características" box, top/heart/base notes, the full ingredient list and how to use
# (with precautions). They are site-editor blocks embedded in each page as JSON.
DETAILS = os.path.join(ROOT, "data", "details-source.json")
BLOCK = re.compile(r'\{"contentJSON":"((?:[^"\\]|\\.)*)","contentIds":\[[^\]]*\],"treePath":"((?:[^"\\]|\\.)*)"\}')


def page_details(link):
    text = get(link)
    d = {}
    for m in BLOCK.finditer(text):
        try:
            c = json.loads(json.loads('"' + m.group(1) + '"'))
            tp = json.loads('"' + m.group(2) + '"')
        except ValueError:
            continue
        leaf = tp.rsplit("/", 1)[-1]
        if leaf == "rich-text#list-benefits":
            d["benefits"] = c.get("text", "")
        elif leaf == "rich-text#description-product-pdp":
            d["description"] = c.get("text", "")
        elif "product-tab-layout-content-03" in tp and leaf.startswith("rich-text#text-") and c.get("text", "").strip():
            d.setdefault("howto", []).append(c["text"])
        elif leaf == "garbe-product-composition":
            d["composition"] = [[i.get("__editorItemTitle", "").strip(" :"), i.get("description", "").strip()] for i in c.get("compositionList", [])]
    return d


def details():
    src = json.load(open(SOURCE))
    out = json.load(open(DETAILS)) if os.path.exists(DETAILS) else {}

    def one(p):
        for attempt in range(3):
            try:
                return p["id"], page_details(p["link"])
            except Exception as e:  # noqa: BLE001 - retry network errors
                err = e
                time.sleep(2 * (attempt + 1))
        print("  failed", p["id"], err)
        return p["id"], None

    todo = [p for p in src if p.get("link")]
    with concurrent.futures.ThreadPoolExecutor(6) as ex:
        for i, (pid, d) in enumerate(ex.map(one, todo), 1):
            if d is not None:
                out[pid] = d
            if i % 50 == 0:
                print(f"  {i}/{len(todo)}")
    with open(DETAILS, "w") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    filled = sum(1 for d in out.values() if d.get("composition") or d.get("howto"))
    print(f"{len(out)} products -> {DETAILS} ({filled} with notes/ingredients or how to use)")


DETAILS_TR = os.path.join(ROOT, "data", "details-translations.json")  # Portuguese -> {en, ar, pt_gulf?}
DETAILS_JS = os.path.join(ROOT, "assets", "js", "details.js")
NOTE_KEYS = {"notas de saída": "top", "notas de topo": "top", "notas de corpo": "heart", "notas de coração": "heart", "notas de fundo": "base"}


def tidy(t, any_case=False):
    t = re.sub(r"</?p>|<br\s*/?>", "\n", t, flags=re.I if any_case else 0).replace("**", "")  # else stray <P> go in tri()
    return re.sub(r"\n{2,}", "\n\n", t).strip()


def split_list(v):
    """'Pimenta Rosa, Bergamota e Mandarina.' -> ['Pimenta Rosa', 'Bergamota', 'Mandarina']"""
    return [n.strip(" .") for n in re.split(r",\s*|\s+e\s+", v.strip(" .")) if n.strip(" .")]


def ingredient_list(v):
    """'Alcohol/Álcool Etílico, Aqua/Água, …' -> (INCI names, Portuguese names)."""
    items = [i.strip() for i in re.split(r",\s*(?![^()]*\))", v.strip().rstrip(".")) if i.strip()]
    items = [i for i in items if "/" in i or not i[0].islower()]  # drop stray fragments ("de Benzila")
    inci = [i.split("/", 1)[0].strip() for i in items]
    pt = [i.split("/", 1)[1].strip() if "/" in i else i for i in items]
    return ", ".join(inci) + ".", ", ".join(pt) + "."


def parsed_details(d):
    """One product's page blocks -> family, highlights, notes, actives, ingredients, how to use."""
    out = {"highlights": [], "notes": {}, "actives": []}
    for line in (d.get("benefits") or "").split("\n"):
        line = line.strip(" •\t-")
        if not line:
            continue
        if line.lower().startswith("caminho olfativo"):
            out["family"] = line.split(":", 1)[1].strip(" .")
        else:
            out["highlights"].append(line)
    for label, v in d.get("composition", []):
        lab = label.lower().strip()
        if lab == "caminho olfativo":
            out["family"] = v.strip(" .")
        elif lab in NOTE_KEYS:
            out["notes"][NOTE_KEYS[lab]] = split_list(v)
        elif lab.startswith("composi"):
            out["ingredients"] = ingredient_list(v)
        elif v.strip():
            out["actives"].append((label.strip(), v.strip()))
    for h in d.get("howto", []):
        parts = re.split(r"\n?Precauções:?", tidy(h), maxsplit=1)
        out["howto"] = re.sub(r"^modo de usar:?\s*", "", parts[0].strip(), flags=re.I)
        if len(parts) > 1:
            rest = re.split(r"\n?Advertência:?", parts[1], maxsplit=1)
            out["caution"] = rest[0].strip()
            if len(rest) > 1:
                out["warning"] = rest[1].strip()
    out["description"] = tidy(d.get("description", ""), any_case=True)
    return out


def details_js(tr_desc):
    """Write assets/js/details.js (loaded by product pages) and return the official notes and
    the longer page descriptions for catalog.js."""
    if not (os.path.exists(DETAILS) and os.path.exists(DETAILS_TR)):
        return {}, {}
    raw = json.load(open(DETAILS))
    trs = json.load(open(DETAILS_TR))
    tx, index, missing = [], {}, set()

    def tri(pt, strip_label=False):
        pt = re.sub(r"</?p>", "", pt, flags=re.I).strip()
        t = trs.get(pt)
        if not t:
            missing.add(pt[:60])
            t = {"en": pt, "ar": pt}
        row = {"en": t["en"], "ar": t["ar"], "pt": t.get("pt_gulf") or pt}
        if strip_label:  # "Modo de usar: …" was translated with its label; keep the text only
            row = {k: re.sub(r"^[^:\n]{2,30}:\s*", "", v) if k != "pt" else v for k, v in row.items()}
        return row

    def ref(row):
        key = json.dumps(row, ensure_ascii=False, sort_keys=True)
        if key not in index:
            index[key] = len(tx)
            tx.append(row)
        return index[key]

    prods, notes, descs = {}, {}, {}
    for pid, d in raw.items():
        x = parsed_details(d)
        e = {}
        if x.get("family"):
            e["f"] = ref(tri(x["family"]))
        if x["highlights"]:
            e["h"] = [ref(tri(h)) for h in x["highlights"]]
        if x["actives"]:
            e["a"] = [[ref(tri(n)), ref(tri(v))] for n, v in x["actives"]]
        if x.get("ingredients"):
            inci, pt = x["ingredients"]
            e["i"] = ref({"en": inci, "ar": inci, "pt": pt})
        if x.get("howto"):
            raw_how = next((tidy(h) for h in d.get("howto", [])), "")
            labelled = bool(re.match(r"^modo de usar:?", raw_how, flags=re.I))
            e["u"] = ref(tri(re.split(r"\n?Precauções:?", raw_how, maxsplit=1)[0].strip(), strip_label=labelled))
        if x.get("caution"):
            e["c"] = ref(tri(x["caution"]))
        if x.get("warning"):
            e["w"] = ref(tri(x["warning"]))
        if e:
            prods[pid] = e
        if x["notes"]:
            notes[pid] = {k: [[tri(n)["en"], tri(n)["ar"], tri(n)["pt"]] for n in v] for k, v in x["notes"].items()}
        if x["description"] and x["description"] in trs:
            descs[pid] = tri(x["description"])
    with open(DETAILS_JS, "w") as f:
        f.write("/* wepink Gulf — full product details from wepink.com.br's product pages (highlights,\n")
        f.write(" * scent family, key ingredients, ingredient list, how to use, precautions), generated by\n")
        f.write(" * scripts/import_catalog.py from data/details-source.json and data/details-translations.json.\n")
        f.write(" * tx: shared strings {en, ar, pt}; p: product id -> indexes into tx\n")
        f.write(" * (f family, h highlights, a [ingredient, what it does], i ingredient list, u how to use,\n")
        f.write(" * c precautions, w warning). Loaded by product pages when they need it. */\n")
        f.write("window.WP_DETAILS = ")
        json.dump({"tx": tx, "p": prods}, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(f"{len(prods)} products, {len(tx)} strings -> {DETAILS_JS} ({os.path.getsize(DETAILS_JS) // 1024} KB, {len(missing)} untranslated)")
    return notes, descs


def js():
    src = json.load(open(SOURCE))
    tr = json.load(open(TRANSLATIONS)) if os.path.exists(TRANSLATIONS) else {}
    page_notes, page_desc = details_js(tr)  # wepink Brasil's official notes and fuller descriptions
    rows, missing = [], 0
    for p in src:
        t = tr.get(p["id"])
        if not t:
            missing += 1
            t = {}
        fragrance = p["type"] in FRAGRANCE_TYPES
        cutout = f"assets/products/cutout/{p['id']}.webp"
        row = {
            "id": p["id"],
            "cat": p["cat"],
            "type": p["type"],
            "line": p["line"] if fragrance else (t.get("name_en") or p["line"]),
            "lineAr": t.get("name_ar"),  # the name in Arabic letters (scripts/arabic_names.py)
            "size": p["size"],
            "price": p["price"],
            "family": p["family"],
            "gender": p["gender"],
            "badge": p["badge"],
            "color": p.get("color", "#E6007E"),
            "color2": p.get("color2", "#FFE3EF"),
            "cutout": cutout if os.path.exists(os.path.join(ROOT, cutout)) else None,
            "image": p["images"][0] if p.get("images") else None,
            "images": p.get("images", []),
            "remote": p.get("remote", []),
            "rank": p.get("rank"),  # wepink Brasil's best-seller ranking (1 = top seller)
            "hero": os.path.exists(os.path.join(ROOT, "assets/products/hero", p["id"] + ".webp")) or None,  # has campaign shots
            "tagline": {"en": t.get("tagline_en") or "", "ar": t.get("tagline_ar") or "", "pt": t.get("tagline_pt") or ""},
            "desc": page_desc.get(p["id"]) or {"en": t.get("desc_en") or p["short_pt"] or p["desc_pt"][:300], "ar": t.get("desc_ar") or t.get("desc_en") or p["short_pt"], "pt": t.get("desc_pt") or ""},
            "notes": page_notes.get(p["id"]) or t.get("notes") or {},
            "source": p["link"],
        }
        # The live store reads products from the database, which was filled with the earlier
        # notes and descriptions; "was" lets it tell an untouched row (show wepink Brasil's
        # official notes / fuller description) from one the team edited in the admin panel.
        was = {}
        if p["id"] in page_notes and t.get("notes"):
            was["notes"] = "|".join(",".join(n[0] for n in t["notes"].get(k, [])) for k in ("top", "heart", "base"))
        if p["id"] in page_desc:
            was["desc"] = (t.get("desc_en") or p["short_pt"] or p["desc_pt"][:300])[:60]
        if was:
            row["was"] = was
        rows.append({k: v for k, v in row.items() if v not in (None, "", [], {})} | {"notes": row["notes"]})
    with open(CATALOG_JS, "w") as f:
        f.write("/* wepink Gulf — product catalogue, generated by scripts/import_catalog.py.\n")
        f.write(" * Edit data/translations.json for copy and re-run the script; don't edit by hand.\n */\n")
        f.write("window.WP_CATALOG = ")
        json.dump(rows, f, ensure_ascii=False, indent=1)
        f.write(";\n")
    print(f"{len(rows)} products -> {CATALOG_JS} ({missing} without translations)")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "fetch":
        fetch(sys.argv[2])
    elif cmd == "build":
        build(sys.argv[2])
    elif cmd == "update":
        update(sys.argv[2])
    elif cmd == "details":
        details()
    elif cmd == "js":
        js()
    else:
        print(__doc__)
