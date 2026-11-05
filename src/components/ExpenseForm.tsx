"use client";

import React, { useState } from "react";
import { PlusCircle, Receipt, Store, Calendar, FileText, Image, AlertCircle, Check } from "lucide-react";
import { CATEGORIES, ExpenseItem } from "@/types/expense";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<ExpenseItem, "id" | "createdAt">) => Promise<void>;
  isLoading: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, isLoading }) => {
  const [date, setDate] = useState<string>("");

  React.useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);
  const [category, setCategory] = useState<string>(CATEGORIES[1]); // Default to Material Struktur Bawah
  const [itemName, setItemName] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<string>("sak");
  const [unitPrice, setUnitPrice] = useState<number>(82000);
  const [vendor, setVendor] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);

  const calculatedTotal = qty * unitPrice;

  // Handle image upload from camera / gallery to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB agar penyimpanan hemat dan cepat.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setReceiptUrl(base64);
        setPreviewImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      alert("Mohon isi nama barang atau uraian pengeluaran!");
      return;
    }

    await onAddExpense({
      date,
      category,
      itemName,
      qty,
      unit,
      unitPrice,
      totalPrice: calculatedTotal,
      vendor,
      notes,
      receiptUrl,
    });

    // Reset some inputs
    setItemName("");
    setVendor("");
    setNotes("");
    setReceiptUrl("");
    setPreviewImage(null);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-5 text-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            Catat Pengeluaran Baru
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Otomatis tersimpan & terhubung ke Google Spreadsheet
          </p>
        </div>
        {successMsg && (
          <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1 font-medium animate-pulse">
            <Check className="w-3.5 h-3.5" /> Tersimpan!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Row 1: Tanggal & Kategori */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Kategori Pos Biaya
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Uraian Barang */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Uraian Barang / Item Pengeluaran <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Semen Gresik 50kg, Besi 13 Ulir SMTY, Pasir 2 Pick Up..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            className="w-full text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Row 3: Qty, Satuan, Harga Satuan, Total */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah (Qty)</label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={qty}
              onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
              required
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-center font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Satuan</label>
            <input
              type="text"
              placeholder="sak / btg / pick up"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Satuan (Rp)</label>
            <input
              type="number"
              min="0"
              step="1000"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
              required
              className="w-full text-sm border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-semibold text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Total Biaya (Rp)</label>
            <div className="text-sm font-bold text-slate-900 py-1.5 px-2 bg-emerald-50 border border-emerald-200 rounded-lg text-right truncate">
              {new Intl.NumberFormat("id-ID").format(calculatedTotal)}
            </div>
          </div>
        </div>

        {/* Row 4: Toko & Catatan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-slate-400" /> Toko Bangunan / Penerima
            </label>
            <input
              type="text"
              placeholder="Contoh: Toko Bangunan Mitra, Pangkalan Pasir, Kang Nono..."
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan / Catatan Tambahan</label>
            <input
              type="text"
              placeholder="Contoh: Pembayaran termin 1, nota dititip tukang..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
            />
          </div>
        </div>

        {/* Row 5: Upload Foto Bukti Nota */}
        <div className="border-t border-slate-100 pt-3">
          <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-slate-500" /> Foto Nota / Kwitansi (Opsional)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800 hover:file:bg-slate-200 cursor-pointer"
            />
            {previewImage && (
              <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setReceiptUrl("");
                  }}
                  className="absolute inset-0 bg-black/60 text-white text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <span>Menyimpan ke Google Spreadsheet...</span>
          ) : (
            <>
              <Receipt className="w-4 h-4 text-emerald-400" />
              Simpan Pengeluaran
            </>
          )}
        </button>
      </form>
    </div>
  );
};
