export interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  vendor: string;
  notes?: string;
  receiptUrl?: string; // Data URL (Base64) or external link
  createdAt?: string;
}

export interface BudgetCategory {
  category: string;
  budget: number;
  pessimistic: number;
}

export const CATEGORIES = [
  "Jasa Tukang Borongan",
  "Material Struktur Bawah & Pondasi",
  "Material Struktur Atas & Dak Beton",
  "Material Pasangan Dinding & Partisi",
  "Material Rangka Atap & Plafond",
  "Lantai Granit, Keramik & Cat",
  "Kusen Pintu/Jendela, Sanitair & MEP",
  "Operasional & Tak Terduga"
] as const;

export const DEFAULT_BUDGETS: BudgetCategory[] = [
  { category: "Jasa Tukang Borongan", budget: 110000000, pessimistic: 110000000 },
  { category: "Material Struktur Bawah & Pondasi", budget: 47500000, pessimistic: 52250000 },
  { category: "Material Struktur Atas & Dak Beton", budget: 62500000, pessimistic: 68750000 },
  { category: "Material Pasangan Dinding & Partisi", budget: 42500000, pessimistic: 46750000 },
  { category: "Material Rangka Atap & Plafond", budget: 32500000, pessimistic: 35750000 },
  { category: "Lantai Granit, Keramik & Cat", budget: 37500000, pessimistic: 41250000 },
  { category: "Kusen Pintu/Jendela, Sanitair & MEP", budget: 27500000, pessimistic: 30250000 },
  { category: "Operasional & Tak Terduga", budget: 15000000, pessimistic: 16500000 },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: "EXP-INIT-1",
    date: "2026-11-01",
    category: "Jasa Tukang Borongan",
    itemName: "DP Uang Muka Tukang (20%) - Pasang Bouwplank",
    qty: 1,
    unit: "termin",
    unitPrice: 22000000,
    totalPrice: 22000000,
    vendor: "Kang Nono (Pemborong)",
    notes: "Sesuai Pasal 4 Surat Perjanjian Pemborongan",
    receiptUrl: ""
  },
  {
    id: "EXP-INIT-2",
    date: "2026-11-02",
    category: "Material Struktur Bawah & Pondasi",
    itemName: "Semen Portland (50 kg)",
    qty: 50,
    unit: "sak",
    unitPrice: 82000,
    totalPrice: 4100000,
    vendor: "Toko Bangunan Mitra",
    notes: "Tahap awal pondasi tapak 1x1m",
    receiptUrl: ""
  },
  {
    id: "EXP-INIT-3",
    date: "2026-11-02",
    category: "Material Struktur Bawah & Pondasi",
    itemName: "Pasir Pasang/Cor",
    qty: 6,
    unit: "pick up",
    unitPrice: 230000,
    totalPrice: 1380000,
    vendor: "Pangkalan Pasir",
    notes: "Pengiriman pertama",
    receiptUrl: ""
  },
  {
    id: "EXP-INIT-4",
    date: "2026-11-03",
    category: "Material Struktur Bawah & Pondasi",
    itemName: "Besi 13 Ulir SMTY (12 mm)",
    qty: 40,
    unit: "batang",
    unitPrice: 99000,
    totalPrice: 3960000,
    vendor: "Distributor Besi SNI",
    notes: "Untuk tulangan pondasi tapak 1x1m & sloof",
    receiptUrl: ""
  },
  {
    id: "EXP-INIT-5",
    date: "2026-11-03",
    category: "Material Struktur Bawah & Pondasi",
    itemName: "Besi 8 Polos TJ (7.5 mm)",
    qty: 30,
    unit: "batang",
    unitPrice: 45000,
    totalPrice: 1350000,
    vendor: "Distributor Besi SNI",
    notes: "Untuk begel sloof",
    receiptUrl: ""
  }
];
