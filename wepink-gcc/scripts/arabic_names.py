#!/usr/bin/env python3
"""Write every product name in Arabic letters, the way it sounds.

Names are not translated: "Heaven Blue" is هيفن بلو and "Obsessed" is أوبسيسد,
just as a Gulf shopper would say them. This script fills data/translations.json:

  - name_ar for every product (its full English name, word by word);
  - English names inside the Arabic taglines, descriptions and notes.

The wepink brand name and technical marks (SPF, UVA/UVB, PPD, 10x) stay in
Latin letters. Add a word to WORDS when a new product brings one, then run:

  python3 scripts/arabic_names.py
  python3 scripts/import_catalog.py js
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "data", "catalog-source.json")
TRANSLATIONS = os.path.join(ROOT, "data", "translations.json")

WORDS = {
    "Absolute": "أبسولوت", "Acne": "أكني", "Air": "إير", "All": "أول", "Ametist": "أميثيست", "Aneeq": "أنيق",
    "Anniversary": "أنيفيرسري", "Anti": "أنتي", "Aqua": "أكوا", "Aurale": "أورال", "Auretx": "أوريتكس",
    "Authentic": "أوثنتك", "Azure": "أزور", "Banana": "بنانا", "Bar": "بار", "Belle": "بيل", "Birthday": "بيرثداي",
    "Black": "بلاك", "Blanc": "بلان", "Bloom": "بلوم", "Blue": "بلو", "Blush": "بلاش", "Body": "بودي",
    "Boldeye": "بولد آي", "Bomb": "بومب", "Booster": "بوستر", "Bourbon": "بوربون", "Brave": "بريف",
    "Breeze": "بريز", "Bride": "برايد", "Calm": "كالم", "Candy": "كاندي", "Capri": "كابري", "Cassera": "كاسيرا",
    "Castillo": "كاستيلو", "Castle": "كاسل", "Celebrate": "سيليبريت", "Celebration": "سيليبريشن",
    "Celestial": "سيليستيال", "Changes": "تشينجز", "Charm": "تشارم", "Cherish": "تشيريش", "Cherry": "تشيري",
    "Choco": "تشوكو", "Choices": "تشويسز", "Christmas": "كريسماس", "Clean": "كلين", "Cleanser": "كلينزر",
    "Cleansing": "كلينزينج", "Coconut": "كوكونت", "Collection": "كوليكشن", "Conditioner": "كونديشنر",
    "Conditioning": "كونديشنينج", "Contour": "كونتور", "Cookies": "كوكيز", "Cosmik": "كوزميك", "Crave": "كريف", "Cream": "كريم",
    "Crimson": "كريمسون", "Cuddle": "كادل", "Cèdre": "سيدر", "Darkest": "داركست", "Deep": "ديب",
    "Delight": "ديلايت", "Deluxe": "ديلوكس", "Di": "دي", "Diva": "ديفا", "Divine": "ديفاين", "Divinus": "ديفينوس",
    "Doré": "دوريه", "Dragon": "دراجون", "Dream": "دريم", "Dry": "دراي", "Duo": "ديو", "Earth": "إيرث",
    "Edition": "إيديشن", "Element": "إليمنت", "Elowen": "إيلوين", "Ember": "إمبر", "Essencial": "إسنسيال",
    "Essential": "إسنشال", "Eternal": "إيترنال", "Ever": "إيفر", "Exclusif": "إكسكلوسيف",
    "Exclusive": "إكسكلوسيف", "Exfoliating": "إكسفولييتنج", "Eye": "آي", "Eyescare": "آيز كير",
    "Facial": "فيشال", "Fantasy": "فانتاسي", "Fatal": "فيتال", "Feive": "فيف", "Femme": "فيم", "Fever": "فيفر",
    "Fig": "فيج", "Fire": "فاير", "Flora": "فلورا", "Foam": "فوم", "Fonseca": "فونسيكا", "For": "فور",
    "Foundation": "فاونديشن", "Gel": "جل", "Ghadan": "غدان", "Gloss": "جلوس", "Glow": "جلو", "Gold": "جولد",
    "Golden": "جولدن", "Green": "جرين", "Groom": "جروم", "Hair": "هير", "Happy": "هابي", "Haylas": "هيلاس",
    "Heaven": "هيفن", "Her": "هير", "Holiday": "هوليداي", "Honey": "هني", "Hope": "هوب", "Hug": "هاج",
    "Hydracare": "هايدراكير", "Illuminator": "إلوميناتور", "In": "إن", "in": "إن", "Infinity": "إنفينيتي",
    "Intense": "إنتنس", "Jujuba": "جوجوبا", "Kids": "كيدز", "King": "كينج", "Land": "لاند", "Latina": "لاتينا",
    "Latte": "لاتيه", "Lauv": "لاف", "Lavanda": "لافاندا", "Lavender": "لافندر", "Leave": "ليف",
    "Liberté": "ليبرتيه", "Life": "لايف", "Light": "لايت", "Limited": "ليميتد", "Lion": "ليون", "Lip": "ليب",
    "Lips": "ليبس", "Lipstick": "ليبستيك", "Liquid": "ليكويد", "Lovely": "لافلي", "Luxury": "لاكشري",
    "Macchiato": "ماكياتو", "Magnetic": "ماجنتك", "Makeup": "ميك أب", "Mallorie": "مالوري",
    "Marshmallow": "مارشميلو", "Martin": "مارتن", "Mask": "ماسك", "Matte": "مات", "Mauve": "موف",
    "Merry": "ميري", "Mist": "ميست", "Moisturizer": "مويسترايزر", "Moon": "مون",
    "Multifunctional": "مالتي فانكشنال", "My": "ماي", "MyProtection": "ماي بروتكشن", "Myskin": "ماي سكين",
    "New": "نيو", "Night": "نايت", "Noir": "نوار", "Nuit": "نوي", "Obsessed": "أوبسيسد",
    "Obsidian": "أوبسيديان", "Oil": "أويل", "On": "أون", "on": "أون", "One": "ون", "Onyx": "أونيكس",
    "PDRN": "بي دي آر إن", "Peace": "بيس", "Peach": "بيتش", "Pear": "بير", "Pencil": "بنسل", "Perfect": "بيرفكت",
    "Pink": "بينك", "Pirulipop": "بيروليبوب", "Platiné": "بلاتينيه", "Plim": "بليم", "Pourpre": "بوربر",
    "Premium": "بريميوم", "Protein": "بروتين", "Pure": "بيور", "Pureblixx": "بيوربليكس", "Quartet": "كوارتيت",
    "Radiance": "راديانس", "Raffi": "رافي", "Rawr": "رور", "Red": "ريد", "Relax": "ريلاكس", "Relics": "ريليكس",
    "Remover": "ريموفر", "Repair": "ريبير", "Retractable": "ريتراكتابل", "Rhodolite": "رودولايت", "Roll": "رول",
    "Rouge": "روج", "Royale": "رويال", "Ruby": "روبي", "Sabonete": "سابونيتي", "Sadeeq": "صديق",
    "Santal": "سانتال", "Scarlette": "سكارليت", "Scrub": "سكراب", "Seraph": "سيراف", "Serene": "سيرين",
    "Serum": "سيروم", "Set": "سِت", "Shampoo": "شامبو", "Shower": "شاور", "Signs": "ساينز", "Silk": "سيلك",
    "Silver": "سيلفر", "Skincare": "سكين كير", "Sleep": "سليب", "Soft": "سوفت", "Sorcerer": "سورسرر",
    "Sorvetin": "سورفيتين", "SPF": "إس بي إف", "Spell": "سبيل", "Splash": "سبلاش", "Spray": "سبراي", "Strong": "سترونج",
    "Suncare": "صن كير", "Sunny": "صني", "Sunscreen": "صن سكرين", "Sunset": "سانست", "Supreme": "سوبريم",
    "Sweet": "سويت", "Tawny": "توني", "The": "ذا", "Three": "ثري", "Tint": "تينت", "Titanium": "تيتانيوم",
    "Tonic": "تونيك", "Touch": "تاتش", "Treatment": "تريتمنت", "Trip": "تريب", "Tropical": "تروبيكال",
    "Tyrie": "تايري", "Ultra": "ألترا", "Vallora": "فالورا", "Vanilla": "فانيلا", "Veil": "فيل",
    "Velours": "فيلور", "Venice": "فينيس", "Verano": "فيرانو", "VF": "في إف", "Virginia": "فيرجينيا",
    "Warm": "وورم", "Wash": "ووش", "Water": "ووتر", "We": "وي", "Weblush": "وي بلاش", "Welips": "وي ليبس",
    "Welumi": "ويلومي", "Whisper": "ويسبر", "White": "وايت", "Wipes": "وايبس", "Wish": "ويش",
    "Wonbloom": "وونبلوم", "Wonderful": "وندرفل", "Xis": "شيس", "Yahya": "يحيى", "Year": "يير",
    "Zodiac": "زودياك", "Íntimo": "إنتيمو", "5th": "فيفث",
}
# Latin that stays as it is inside Arabic copy: the brand and technical marks.
KEEP = re.compile(r"^(wepink( beauty)?|SPF( \d+)?|UVA/UVB|UVA|UVB|PPD|\d+(\.\d+)?x?)$")
SYMBOLS = {"&": "آند", "+": "+"}


def word(w):
    if re.fullmatch(r"\d+(\.\d+)?", w) or w in SYMBOLS:
        return SYMBOLS.get(w, w)
    if w.endswith("+") and w[:-1] in WORDS:  # "Eternal+"
        return WORDS[w[:-1]] + "+"
    if w not in WORDS:
        raise KeyError(w)
    return WORDS[w]


def arabic(name):
    """'Heaven Santal & Fig' -> 'هيفن سانتال آند فيج'; '10-in-1' -> '10 إن 1'."""
    parts = re.findall(r"[^\s\-]+", name.replace("Leave-In", "Leave In"))
    return " ".join(word(p) for p in parts)


# A run of Latin inside Arabic text: words, numbers and the joiners between them.
LATIN_RUN = re.compile(r"[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9'’&+.\-/ ]*[A-Za-zÀ-ÿ0-9+]|[A-Za-zÀ-ÿ]")


def in_copy(text):
    if not text:
        return text
    text = text.replace("الـpeeling", "البيلينج")
    text = re.sub(r"فيتامين ([CE])\b", lambda m: "فيتامين " + {"C": "سي", "E": "إي"}[m.group(1)], text)

    def swap(m):
        run = m.group(0)
        if not re.search(r"[A-Za-z]", run) or KEEP.match(run):
            return run
        # keep a trailing technical mark ("Suncare SPF 50") and brand words in Latin
        out = []
        for chunk in re.split(r"(\bSPF \d+|\bwepink(?: beauty)?|UVA/UVB)", run):
            if not chunk:
                continue
            out.append(chunk if KEEP.match(chunk.strip()) else arabic(chunk.strip()))
        return " ".join(out)

    return LATIN_RUN.sub(swap, text)


def main():
    src = {p["id"]: p for p in json.load(open(SOURCE))}
    tr = json.load(open(TRANSLATIONS))
    unknown = set()
    for pid, t in tr.items():
        p = src.get(pid)
        if not p:
            continue
        try:
            t["name_ar"] = arabic(t.get("name_en") or p["line"])
            for k in ("tagline_ar", "desc_ar"):
                t[k] = in_copy(t.get(k))
            for layer in (t.get("notes") or {}).values():
                for pair in layer:
                    pair[1] = in_copy(pair[1])
        except KeyError as e:
            unknown.add(e.args[0])
    if unknown:
        sys.exit("No Arabic spelling yet for: " + ", ".join(sorted(unknown)))
    with open(TRANSLATIONS, "w") as f:
        json.dump(tr, f, ensure_ascii=False, indent=1)
    print(f"{len(tr)} products: Arabic names written")


if __name__ == "__main__":
    main()
