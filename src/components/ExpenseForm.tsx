"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Edit3, Receipt, Store, Calendar, FileText, Image, Check, X, Mic, MicOff, Calculator } from "lucide-react";
import { CATEGORIES, ExpenseItem } from "@/types/expense";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<ExpenseItem, "id" | "createdAt">) => Promise<void>;
  onUpdateExpense: (expense: ExpenseItem) => Promise<void>;
  editingExpense: ExpenseItem | null;
  onCancelEdit: () => void;
  onOpenCalculator: () => void;
  prefillData?: {
    category?: string;
    itemName?: string;
    qty?: number;
    unit?: string;
    unitPrice?: number;
  } | null;
  isLoading: boolean;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onAddExpense,
  onUpdateExpense,
  editingExpense,
  onCancelEdit,
  onOpenCalculator,
  prefillData,
  isLoading,
}) => {
  const [date, setDate] = useState<string>("");
  const [category, setCategory] = useState<string>(CATEGORIES[1]);
  const [itemName, setItemName] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<string>("btg");
  const [unitPrice, setUnitPrice] = useState<number>(29000);
  const [paymentStatus, setPaymentStatus] = useState<"Lunas" | "Bon / Tempo">("Lunas");
  const [vendor, setVendor] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date || "");
      setCategory(editingExpense.category || CATEGORIES[1]);
      setItemName(editingExpense.itemName || "");
      setQty(editingExpense.qty || 1);
      setUnit(editingExpense.unit || "btg");
      setUnitPrice(editingExpense.unitPrice || 0);
      setPaymentStatus(editingExpense.paymentStatus || "Lunas");
      setVendor(editingExpense.vendor || "");
      setNotes(editingExpense.notes || "");
      setReceiptUrl(editingExpense.receiptUrl || "");
      setPreviewImage(editingExpense.receiptUrl || null);
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setItemName("");
      setPaymentStatus("Lunas");
      setVendor("");
      setNotes("");
      setReceiptUrl("");
      setPreviewImage(null);
    }
  }, [editingExpense]);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.category) setCategory(prefillData.category);
      if (prefillData.itemName) setItemName(prefillData.itemName);
      if (prefillData.qty !== undefined) setQty(prefillData.qty);
      if (prefillData.unit) setUnit(prefillData.unit);
      if (prefillData.unitPrice !== undefined) setUnitPrice(prefillData.unitPrice);
    }
  }, [prefillData]);

  const calculatedTotal = qty * unitPrice;

  // Fitur #7: Voice-to-Text Input (SpeechRecognition API)
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Browser Anda belum mendukung input suara. Gunakan Google Chrome atau browser modern di HP.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setItemName((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB agar hemat penyimpanan.");
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
      alert("Mohon isi nama barang atau uraian transaksi!");
      return;
    }

    if (editingExpense) {
      await onUpdateExpense({
        ...editingExpense,
        date,
        category,
        itemName,
        qty,
        unit,
        unitPrice,
        totalPrice: calculatedTotal,
        paymentStatus,
        vendor,
        notes,
        receiptUrl,
      });
      onCancelEdit();
    } else {
      await onAddExpense({
        date,
        category,
        itemName,
        qty,
        unit,
        unitPrice,
        totalPrice: calculatedTotal,
        paymentStatus,
        vendor,
        notes,
        receiptUrl,
      });
      setItemName("");
      setVendor("");
      setNotes("");
      setReceiptUrl("");
      setPreviewImage(null);
    }

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-xl transition-all">
      {/* Form Header */}
      <div
        className={`p-4 sm:p-5 flex items-center justify-between border-b transition-colors ${
          editingExpense
            ? "bg-amber-500/10 border-amber-500/20 text-amber-200"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
        }`}
      >
        <div>
          <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-white">
            {editingExpense ? (
              <>
                <Edit3 className="w-5 h-5 text-amber-400" />
                Edit Transaksi
              </>
            ) : (
              <>
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Catat Pengeluaran Baru
              </>
            )}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            {editingExpense
              ? "Ubah data lalu simpan ke Google Sheets"
              : "Langsung tersimpan & tersinkronisasi"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Fitur #2: Quick Material Calculator Trigger */}
          <button
            type="button"
            onClick={onOpenCalculator}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            title="Kalkulator Estimasi Bahan"
          >
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Kalkulator</span>
          </button>

          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-xl flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Batal
            </button>
          )}

          {successMsg && (
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1 font-medium animate-pulse">
              <Check className="w-3.5 h-3.5" /> Berhasil!
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5">
        {/* Row 1: Tanggal & Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400" /> Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full text-xs sm:text-sm glass-input rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" /> Kategori Pos Biaya
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs sm:text-sm glass-input rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white bg-slate-900"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Uraian Barang + Voice-to-Text Button */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-slate-300">
              Uraian Barang / Item Pengeluaran <span className="text-rose-400">*</span>
            </label>
            {/* Fitur #7: Voice Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3 h-3" /> Mendengarkan...
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-emerald-400" /> Suara (Voice)
                </>
              )}
            </button>
          </div>

          <input
            type="text"
            placeholder="Contoh: Semen 50kg, Besi 13 Ulir, Pasir 2 Pick Up..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            required
            className="w-full text-xs sm:text-sm glass-input rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Row 3: Qty, Satuan, Harga Satuan, Total */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 glass-panel-subtle p-3 rounded-xl border border-white/5">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-1">Jumlah (Qty)</label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={qty}
              onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
              required
              className="w-full text-xs sm:text-sm glass-input rounded-lg px-2 py-1.5 focus:outline-none text-center font-bold text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-1">Satuan</label>
            <input
              type="text"
              placeholder="sak / btg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full text-xs sm:text-sm glass-input rounded-lg px-2 py-1.5 focus:outline-none text-center text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-1">Harga Satuan (Rp)</label>
            <input
              type="number"
              min="0"
              step="100"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
              required
              className="w-full text-xs sm:text-sm glass-input rounded-lg px-2 py-1.5 focus:outline-none font-semibold text-right text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 mb-1">Total (Rp)</label>
            <div className="text-xs sm:text-sm font-extrabold text-white py-1.5 px-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-right truncate">
              {new Intl.NumberFormat("id-ID").format(calculatedTotal)}
            </div>
          </div>
        </div>

        {/* Row 4: Status Pembayaran (Fitur #3) & Toko */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Status Pembayaran
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full text-xs sm:text-sm glass-input rounded-xl px-3 py-2 focus:outline-none bg-slate-900 text-white"
            >
              <option value="Lunas" className="bg-slate-900">Sudah Lunas</option>
              <option value="Bon / Tempo" className="bg-slate-900">Bon / Tempo (Utang Toko)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" /> Toko Bangunan / Penerima
            </label>
            <input
              type="text"
              placeholder="Contoh: Toko Bangunan Mitra, Kang Nono..."
              value={vendor}
              onChange={(e) => setVendor(e.target.value)}
              className="w-full text-xs sm:text-sm glass-input rounded-xl px-3 py-2 focus:outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Row 5: Catatan */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">Keterangan / Catatan Tambahan</label>
          <input
            type="text"
            placeholder="Contoh: Pembayaran termin 1, nota dititip tukang..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full text-xs sm:text-sm glass-input rounded-xl px-3 py-2 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Row 6: Upload Foto Nota */}
        <div className="border-t border-white/5 pt-3">
          <label className="block text-[11px] font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Image className="w-3.5 h-3.5 text-slate-400" /> Foto Nota / Kwitansi (Opsional)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageChange}
              className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700 cursor-pointer"
            />
            {previewImage && (
              <div className="relative group w-10 h-10 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setReceiptUrl("");
                  }}
                  className="absolute inset-0 bg-black/75 text-rose-400 text-[10px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-1">
          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-1/3 py-2.5 sm:py-3 px-3 rounded-xl border border-white/10 text-slate-300 hover:bg-slate-800 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Batal
            </button>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 text-slate-950 font-bold py-2.5 sm:py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-50 cursor-pointer ${
              editingExpense
                ? "bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950"
                : "bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 glow-emerald"
            }`}
          >
            {isLoading ? (
              <span className="text-slate-900">Menyimpan ke Spreadsheet...</span>
            ) : editingExpense ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                Simpan Perubahan
              </>
            ) : (
              <>
                <Receipt className="w-4 h-4 text-slate-950" />
                Simpan Pengeluaran
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
