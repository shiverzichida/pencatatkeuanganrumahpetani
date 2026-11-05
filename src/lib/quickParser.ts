// Smart parser for Indonesian construction expense quick text / voice input
// Example input: "cerucuk 8 meter 100 pcs @60rb" -> itemName: "cerucuk 8 meter", qty: 100, unit: "pcs", unitPrice: 60000

export interface ParsedQuickExpense {
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  suggestedCategory?: string;
}

export function parseQuickExpense(text: string): ParsedQuickExpense | null {
  if (!text || typeof text !== "string") return null;
  const raw = text.trim();
  if (raw.length < 3) return null;

  // Helper: parse price strings like "60rb", "60k", "60.000", "1.5jt", "60000"
  function parsePrice(s: string): number {
    let clean = s.toLowerCase().trim();
    clean = clean.replace(/^[@at\s]+/, "").replace(/^rp\.?\s*/, "").trim();

    if (clean.endsWith("jt") || clean.endsWith("juta")) {
      const num = parseFloat(clean.replace(/(?:jt|juta)/g, "").replace(",", "."));
      return isNaN(num) ? 0 : Math.round(num * 1000000);
    }
    if (clean.endsWith("rb") || clean.endsWith("ribu") || clean.endsWith("k")) {
      const num = parseFloat(clean.replace(/(?:rb|ribu|k)/g, "").replace(",", "."));
      return isNaN(num) ? 0 : Math.round(num * 1000);
    }

    const digitsOnly = clean.replace(/\./g, "").replace(/,/g, "");
    const parsed = parseInt(digitsOnly, 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Units list
  const unitRegexStr =
    "pcs|btg|batang|sak|zak|pick\\s*up|pickup|rit|m3|kubik|m2|kg|kilo|lembar|lbr|buah|bj|roll|rol|dus|kotak|kaleng|klg|liter|ltr|truk";

  const unitMap: Record<string, string> = {
    batang: "btg",
    zak: "sak",
    kilo: "kg",
    lbr: "lembar",
    rol: "roll",
    klg: "kaleng",
    pickup: "pick up",
    buah: "pcs",
    bj: "pcs",
  };

  let result: {
    itemName: string;
    qty: number;
    unit: string;
    unitPrice: number;
  } | null = null;

  // Pattern 1: <Item Name> <qty> <unit> [@/harga/rp/kosong] <price>
  // e.g. "cerucuk 8 meter 100 pcs @60rb" or "semen 20 sak 82000"
  const p1 = new RegExp(
    `^(.*?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(${unitRegexStr})\\s*(?:@|harga|rp\\.?\\s*)?\\s*(\\d+(?:[.,]\\d+)?(?:\\s*(?:rb|k|ribu|jt|juta))?|\\d{4,})(.*)$`,
    "i"
  );
  const m1 = raw.match(p1);

  if (m1) {
    const itemName = (m1[1] + " " + (m1[5] || "")).trim();
    const qty = parseFloat(m1[2].replace(",", "."));
    const rawUnit = m1[3].toLowerCase().replace(/\s+/g, "");
    const unit = unitMap[rawUnit] || rawUnit;
    const unitPrice = parsePrice(m1[4]);

    if (!isNaN(qty) && qty > 0 && unitPrice > 0) {
      result = { itemName, qty, unit, unitPrice };
    }
  }

  // Pattern 2: <Item Name> <qty> [@/harga] <price> (unit defaults to pcs/btg depending on item)
  // e.g. "cerucuk 8 meter 100 @60rb" or "triplek 9mm 10 @85k"
  if (!result) {
    const p2 =
      /^(.*?)\s+(\d+(?:[.,]\d+)?)\s*(?:(?:@|harga|rp\.?\s*)\s*)(\d+(?:[.,]\d+)?(?:\s*(?:rb|k|ribu|jt|juta))?|\d{4,})(.*)$/i;
    const m2 = raw.match(p2);
    if (m2) {
      const itemName = (m2[1] + " " + (m2[4] || "")).trim();
      const qty = parseFloat(m2[2].replace(",", "."));
      const unitPrice = parsePrice(m2[3]);
      let defaultUnit = "pcs";
      if (/cerucuk|besi|kayu|pipa/i.test(itemName)) defaultUnit = "btg";
      if (/semen|mortar/i.test(itemName)) defaultUnit = "sak";
      if (/pasir|batu|tanah/i.test(itemName)) defaultUnit = "pick up";

      if (!isNaN(qty) && qty > 0 && unitPrice > 0) {
        result = { itemName, qty, unit: defaultUnit, unitPrice };
      }
    }
  }

  if (!result) return null;

  // Determine suggested category based on item name keywords
  let suggestedCategory: string | undefined = undefined;
  const lowerItem = result.itemName.toLowerCase();

  if (
    /cerucuk|pondasi|semen|pasir|batu|besi|wiremesh|split|kerikil|tanah|cor|begel|paku/i.test(
      lowerItem
    )
  ) {
    suggestedCategory = "Material Struktur Bawah & Pondasi";
  } else if (/hebel|bata|mortar|plester|perekat|acian/i.test(lowerItem)) {
    suggestedCategory = "Material Dinding & Pasangan Bata";
  } else if (/baja ringan|genteng|spandek|talang|reng|kanal|atap|plafon|gypsum/i.test(lowerItem)) {
    suggestedCategory = "Material Atap & Plafon";
  } else if (/pipa|pvc|kabel|stop kontak|saklar|lampu|fitting|tandon|toren/i.test(lowerItem)) {
    suggestedCategory = "Material Mekanikal & Elektrikal";
  } else if (/keramik|granit|cat|pintu|jendela|kusen|sanitair|toilet|closet|kran/i.test(lowerItem)) {
    suggestedCategory = "Material Finishing & Cat";
  } else if (/tukang|kuli|gaji|ongkos|borongan|mandor/i.test(lowerItem)) {
    suggestedCategory = "Upah Tukang & Tenaga Kerja";
  } else if (/sewa|molen|angkut|konsumsi|makan|es|rokok|bensin|solar|terpal/i.test(lowerItem)) {
    suggestedCategory = "Operasional Lapangan & Logistik";
  }

  return {
    ...result,
    totalPrice: result.qty * result.unitPrice,
    suggestedCategory,
  };
}
