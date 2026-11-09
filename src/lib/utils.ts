export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
};

/**
 * Format tanggal standar ringkas: "2/Nov/2026"
 * Menangani string ISO, Date string Google Sheets ("Sat Nov 07 2026..."), YYYY-MM-DD, DD/MM/YYYY, dll.
 */
export const formatDateDMonthY = (dStr?: string): string => {
  if (!dStr) return "-";
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  // 1. Cek format YYYY-MM-DD (e.g. 2026-11-02)
  const dashParts = dStr.split("-");
  if (dashParts.length === 3 && dashParts[0].length === 4) {
    const year = dashParts[0];
    const m = months[parseInt(dashParts[1], 10) - 1] || dashParts[1];
    const d = parseInt(dashParts[2], 10);
    return `${d}/${m}/${year}`;
  }

  // 2. Cek format DD/MM/YYYY atau DD/Mmm/YYYY
  const slashParts = dStr.split("/");
  if (slashParts.length === 3) {
    const d = parseInt(slashParts[0], 10);
    if (isNaN(Number(slashParts[1]))) {
      // Sudah berupa "2/Nov/2026"
      return `${d}/${slashParts[1]}/${slashParts[2]}`;
    }
    const m = months[parseInt(slashParts[1], 10) - 1] || slashParts[1];
    const year = slashParts[2];
    return `${d}/${m}/${year}`;
  }

  // 3. Cek format DD/MM ringkas (misal: "7/11" atau "02/11")
  if (slashParts.length === 2 && !isNaN(Number(slashParts[0])) && !isNaN(Number(slashParts[1]))) {
    const d = parseInt(slashParts[0], 10);
    const m = months[parseInt(slashParts[1], 10) - 1] || slashParts[1];
    return `${d}/${m}/2026`;
  }

  // 4. Parse string Date umum (e.g. "Sat Nov 07 2026 00:00:00 GMT+0700 (Western Indonesia Time)" atau ISO)
  try {
    const parsed = new Date(dStr);
    if (!isNaN(parsed.getTime())) {
      const d = parsed.getDate();
      const m = months[parsed.getMonth()];
      const year = parsed.getFullYear();
      return `${d}/${m}/${year}`;
    }
  } catch {
    // Abaikan jika gagal parse Date
  }

  return dStr;
};

/**
 * Format tanggal standar untuk elemen HTML <input type="date">: "YYYY-MM-DD"
 * Menangani string ISO, Date string Google Sheets ("Wed Nov 04 2026..."), DD/MM/YYYY, D/Mmm/YYYY, dll.
 */
export const formatDateForInput = (dStr?: string): string => {
  if (!dStr) return "";
  const trimmed = dStr.trim();
  // 1. Sudah format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // 2. Format YYYY-MM-DDTHH:mm:ss... (ISO)
  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return trimmed.split("T")[0];
  }

  // 3. Format DD/MM/YYYY atau D/M/YYYY atau D/Mmm/YYYY
  const slashParts = trimmed.split("/");
  if (slashParts.length === 3) {
    const day = slashParts[0].padStart(2, "0");
    let month = slashParts[1];
    const year = slashParts[2].length === 2 ? `20${slashParts[2]}` : slashParts[2];
    const months = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];
    const idx = months.findIndex((m) => month.toLowerCase().startsWith(m));
    if (idx !== -1) {
      month = String(idx + 1).padStart(2, "0");
    } else if (!isNaN(Number(month))) {
      month = String(Number(month)).padStart(2, "0");
    }
    return `${year}-${month}-${day}`;
  }

  // 4. Parse string Date umum (e.g. "Wed Nov 04 2026 00:00:00 GMT+0700 (Waktu Indonesia Barat)")
  try {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Abaikan jika gagal parse Date
  }

  return "";
};

export function angkaTerbilang(nilai: number): string {
  const huruf = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  function convert(n: number): string {
    n = Math.floor(Math.abs(n));
    if (n < 12) {
      return huruf[n];
    } else if (n < 20) {
      return convert(n - 10) + " Belas";
    } else if (n < 100) {
      const sisa = n % 10;
      return convert(Math.floor(n / 10)) + " Puluh" + (sisa ? " " + convert(sisa) : "");
    } else if (n < 200) {
      return "Seratus" + (n - 100 ? " " + convert(n - 100) : "");
    } else if (n < 1000) {
      const sisa = n % 100;
      return convert(Math.floor(n / 100)) + " Ratus" + (sisa ? " " + convert(sisa) : "");
    } else if (n < 2000) {
      return "Seribu" + (n - 1000 ? " " + convert(n - 1000) : "");
    } else if (n < 1000000) {
      const sisa = n % 1000;
      return convert(Math.floor(n / 1000)) + " Ribu" + (sisa ? " " + convert(sisa) : "");
    } else if (n < 1000000000) {
      const sisa = n % 1000000;
      return convert(Math.floor(n / 1000000)) + " Juta" + (sisa ? " " + convert(sisa) : "");
    } else if (n < 1000000000000) {
      const sisa = n % 1000000000;
      return convert(Math.floor(n / 1000000000)) + " Miliar" + (sisa ? " " + convert(sisa) : "");
    } else {
      const sisa = n % 1000000000000;
      return convert(Math.floor(n / 1000000000000)) + " Triliun" + (sisa ? " " + convert(sisa) : "");
    }
  }

  if (nilai === 0) return "Nol Rupiah";
  const hasil = convert(nilai).trim();
  return hasil + " Rupiah";
}
