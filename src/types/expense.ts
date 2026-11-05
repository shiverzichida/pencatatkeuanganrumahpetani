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
  paymentStatus?: "Lunas" | "Bon / Tempo"; // Fitur #3: Status Pelunasan
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

export const INITIAL_EXPENSES: ExpenseItem[] = [];
