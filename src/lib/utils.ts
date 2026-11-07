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
