"use client";

import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Edit3,
  Receipt,
  Store,
  Calendar,
  FileText,
  Image,
  Check,
  X,
  Mic,
  MicOff,
  Calculator,
  Sparkles,
  CornerDownLeft,
  Users,
} from "lucide-react";
import { CATEGORIES, ExpenseItem, LaborDetails } from "@/types/expense";
import { parseQuickExpense, ParsedQuickExpense } from "@/lib/quickParser";
import { formatRupiah, formatDateForInput } from "@/lib/utils";

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
    notes?: string;
    weekNo?: number;
  } | null;
  isLoading: boolean;
  categories: string[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onAddExpense,
  onUpdateExpense,
  editingExpense,
  onCancelEdit,
  onOpenCalculator,
  prefillData,
  isLoading,
  categories,
}) => {
  const [date, setDate] = useState<string>("");
  const [category, setCategory] = useState<string>(categories?.[0] || CATEGORIES[0]);
  const [itemName, setItemName] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<string>("btg");
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<"Lunas" | "Bon / Tempo">("Lunas");
  const [vendor, setVendor] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Khusus Upah Tukang (Pekan ke-X, Tanggal A sd B, Pekerja x Gaji)
  const [isLaborMode, setIsLaborMode] = useState<boolean>(false);
  const [laborWeekNo, setLaborWeekNo] = useState<number>(1);
  const [laborStartDate, setLaborStartDate] = useState<string>("");
  const [laborEndDate, setLaborEndDate] = useState<string>("");
  const [laborWorkerCount, setLaborWorkerCount] = useState<number>(3);
  const [laborRatePerWorker, setLaborRatePerWorker] = useState<number>(1000000);

  const updateLaborFields = (
    week = laborWeekNo,
    start = laborStartDate,
    end = laborEndDate,
    workers = laborWorkerCount,
    rate = laborRatePerWorker
  ) => {
    setLaborWeekNo(week);
    setLaborStartDate(start);
    setLaborEndDate(end);
    setLaborWorkerCount(workers);
    setLaborRatePerWorker(rate);

    setQty(workers);
    setUnit("pekerja");
    setUnitPrice(rate);
    setItemName(`Upah tenaga kerja pembangunan rumah`);

    let periodStr = "";
    if (start && end) {
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const formatLaborDate = (dStr: string) => {
        const parts = dStr.split("-");
        if (parts.length === 3) {
          const year = parts[0];
          const m = months[parseInt(parts[1], 10) - 1] || parts[1];
          const d = parseInt(parts[2], 10);
          return `${d}/${m}/${year}`;
        }
        return dStr;
      };
      periodStr = `${formatLaborDate(start)} sd. ${formatLaborDate(end)}`;
    }
    setNotes(
      `Pekan ke-${week}${periodStr ? ` (${periodStr})` : ""} • ${workers} pekerja x ${formatRupiah(rate)}`
    );
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    if (newCat === "Jasa Tukang Borongan") {
      setIsLaborMode(true);
      if (!editingExpense) {
        updateLaborFields(laborWeekNo, laborStartDate, laborEndDate, laborWorkerCount, laborRatePerWorker);
        if (!vendor) setVendor("Mandor / Kepala Tukang");
      }
    } else if (newCat === "Jasa Tukang Lainnya") {
      setIsLaborMode(false);
      if (!editingExpense && (!unit || unit === "pekerja")) {
        setUnit("hari");
        setUnitPrice(150000);
        setQty(1);
      }
      if (!vendor) setVendor("Tukang Harian / Spesialis");
    } else {
      setIsLaborMode(false);
    }
  };

  useEffect(() => {
    if (editingExpense) {
      setDate(formatDateForInput(editingExpense.date) || new Date().toISOString().split("T")[0]);
      setCategory(editingExpense.category || (categories && categories[0]) || CATEGORIES[0]);
      setItemName(editingExpense.itemName || "");
      setQty(Number(editingExpense.qty) || 1);
      setUnit(editingExpense.unit || "btg");
      setUnitPrice(Number(editingExpense.unitPrice) || 0);
      setPaymentStatus(editingExpense.paymentStatus || "Lunas");
      setVendor(editingExpense.vendor || "");
      setNotes(editingExpense.notes || "");
      setReceiptUrl(editingExpense.receiptUrl || "");
      setPreviewImage(editingExpense.receiptUrl || null);

      if (editingExpense.laborDetails || editingExpense.category === "Jasa Tukang Borongan") {
        setIsLaborMode(true);
        if (editingExpense.laborDetails) {
          setLaborWeekNo(editingExpense.laborDetails.weekNo || 1);
          setLaborStartDate(formatDateForInput(editingExpense.laborDetails.startDate) || "");
          setLaborEndDate(formatDateForInput(editingExpense.laborDetails.endDate) || "");
          setLaborWorkerCount(Number(editingExpense.laborDetails.workerCount) || Number(editingExpense.qty) || 3);
          setLaborRatePerWorker(Number(editingExpense.laborDetails.ratePerWorker) || Number(editingExpense.unitPrice) || 1000000);
        }
      } else {
        setIsLaborMode(false);
      }
    } else {
      setDate(new Date().toISOString().split("T")[0]);
      setCategory((categories && categories[0]) || CATEGORIES[0]);
      setItemName("");
      setQty(1);
      setUnit("btg");
      setUnitPrice(0);
      setPaymentStatus("Lunas");
      setVendor("");
      setNotes("");
      setReceiptUrl("");
      setPreviewImage(null);
      setIsLaborMode(false);
    }
  }, [editingExpense]);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.category) {
        setCategory(prefillData.category);
        if (prefillData.category === "Jasa Tukang Borongan") {
          setIsLaborMode(true);
          const w = prefillData.weekNo || 1;
          setLaborWeekNo(w);
          if (!vendor) setVendor("Mandor / Kepala Tukang");
        }
      }
      if (prefillData.itemName) setItemName(prefillData.itemName);
      if (prefillData.qty !== undefined) setQty(prefillData.qty);
      if (prefillData.unit) setUnit(prefillData.unit);
      if (prefillData.unitPrice !== undefined) setUnitPrice(prefillData.unitPrice);
      if (prefillData.notes) setNotes(prefillData.notes);
    }
  }, [prefillData]);

  const calculatedTotal = qty * unitPrice;

  // Smart Parser for Quick Text (e.g. "cerucuk 8 meter 100 pcs @60rb")
  const quickDetected = parseQuickExpense(itemName);

  const applyQuickParsed = (parsed: ParsedQuickExpense) => {
    setItemName(parsed.itemName);
    setQty(parsed.qty);
    setUnit(parsed.unit);
    setUnitPrice(parsed.unitPrice);
    if (parsed.suggestedCategory) {
      setCategory(parsed.suggestedCategory);
    }
  };

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
        const fullText = (itemName ? `${itemName} ${transcript}` : transcript).trim();
        const parsed = parseQuickExpense(fullText);
        if (parsed) {
          applyQuickParsed(parsed);
        } else {
          setItemName(fullText);
        }
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

    const laborData: LaborDetails | undefined = isLaborMode
      ? {
          weekNo: laborWeekNo,
          startDate: laborStartDate,
          endDate: laborEndDate,
          workerCount: laborWorkerCount,
          ratePerWorker: laborRatePerWorker,
        }
      : undefined;

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
        laborDetails: laborData,
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
        laborDetails: laborData,
      });
      setItemName("");
      setVendor("");
      setNotes("");
      setReceiptUrl("");
      setPreviewImage(null);
    }

    setSuccessMsg(true);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(50);
      } catch (e) {
        // ignore
      }
    }
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
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full text-xs sm:text-sm glass-input rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-white bg-slate-900"
            >
              {Array.from(new Set([...(categories && categories.length > 0 ? categories : CATEGORIES), ...(category ? [category] : [])])).map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Panel Khusus Upah Mingguan Tukang (Pekan ke-X, Rentang Tanggal, Qty Pekerja x Gaji) */}
        {isLaborMode && (
          <div className="bg-[#0c1324] border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 space-y-3 animate-in fade-in duration-200 shadow-lg">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Rincian Gaji / Upah Mingguan Tukang
                </h4>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                Kuitansi KJ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Pekan Pembayaran:
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-bold flex-shrink-0">Pekan ke-</span>
                  <input
                    type="number"
                    min="1"
                    value={laborWeekNo}
                    onChange={(e) => updateLaborFields(parseInt(e.target.value) || 1)}
                    className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-extrabold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Periode Pekerjaan (Tanggal A sd. B):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={laborStartDate}
                    onChange={(e) => updateLaborFields(laborWeekNo, e.target.value, laborEndDate)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  />
                  <input
                    type="date"
                    value={laborEndDate}
                    onChange={(e) => updateLaborFields(laborWeekNo, laborStartDate, e.target.value)}
                    className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Jumlah Pekerja:
                </label>
                <input
                  type="number"
                  min="1"
                  value={laborWorkerCount}
                  onChange={(e) => updateLaborFields(laborWeekNo, laborStartDate, laborEndDate, parseInt(e.target.value) || 1)}
                  className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-center font-extrabold text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Upah / Pekerja (Rp):
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={laborRatePerWorker}
                  onChange={(e) => updateLaborFields(laborWeekNo, laborStartDate, laborEndDate, laborWorkerCount, parseInt(e.target.value) || 0)}
                  className="w-full text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-right font-bold text-emerald-400 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Total Gaji Pekan Ini:
                </label>
                <div className="text-xs sm:text-sm font-black text-amber-300 py-1.5 px-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-right font-mono tabular-nums">
                  {formatRupiah(laborWorkerCount * laborRatePerWorker)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Row 2: Uraian Barang + Voice-to-Text Button + Quick NLP Parser */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              Uraian Barang / Item Pengeluaran <span className="text-rose-400">*</span>
            </label>
            {/* Fitur #7: Voice Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                isListening
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse"
                  : "bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/60"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5 text-rose-400" /> Mendengarkan...
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-emerald-400" /> Suara (Voice)
                </>
              )}
            </button>
          </div>

          <input
            type="text"
            placeholder="Ketik langsung: cerucuk 8 meter 100 pcs @60rb..."
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && quickDetected && !editingExpense) {
                e.preventDefault();
                applyQuickParsed(quickDetected);
              }
            }}
            onBlur={() => {
              if (quickDetected && !editingExpense) {
                applyQuickParsed(quickDetected);
              }
            }}
            required
            className="w-full text-sm bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-white placeholder:text-slate-500 font-medium tracking-wide transition-all"
          />

          {/* Quick Detected Live Pill */}
          {quickDetected && (
            <div className="mt-2 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-emerald-300 min-w-0">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block">Pemisahan Cepat Otomatis:</span>
                  <span className="font-bold text-white">{quickDetected.itemName}</span>
                  <span className="text-emerald-300 font-mono ml-1.5 font-bold">
                    {quickDetected.qty} {quickDetected.unit} × {formatRupiah(quickDetected.unitPrice)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => applyQuickParsed(quickDetected)}
                className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold rounded-lg text-xs flex items-center gap-1 transition-all shadow-md cursor-pointer flex-shrink-0"
              >
                <span>Terapkan</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Format Suggestion Pills */}
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Contoh format cepat:</span>
            <button
              type="button"
              onClick={() => {
                const parsed = parseQuickExpense("cerucuk 8 meter 100 pcs @60rb");
                if (parsed) applyQuickParsed(parsed);
              }}
              className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/80 transition-colors cursor-pointer"
            >
              cerucuk 8 meter 100 pcs @60rb
            </button>
            <button
              type="button"
              onClick={() => {
                const parsed = parseQuickExpense("semen 20 sak @82rb");
                if (parsed) applyQuickParsed(parsed);
              }}
              className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/80 transition-colors cursor-pointer"
            >
              semen 20 sak @82rb
            </button>
            <button
              type="button"
              onClick={() => {
                const parsed = parseQuickExpense("pasir 2 pickup @230rb");
                if (parsed) applyQuickParsed(parsed);
              }}
              className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/80 transition-colors cursor-pointer"
            >
              pasir 2 pickup @230rb
            </button>
          </div>
        </div>

        {/* Row 3: Qty, Satuan, Harga Satuan & Subtotal (Luas, Rapi, & Tidak Mepet) */}
        <div className="bg-[#0b101c] p-3.5 sm:p-4 rounded-2xl border border-slate-800/90 shadow-inner space-y-3">
          <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
            {/* Jumlah Qty */}
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 truncate">
                Jumlah (Qty)
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
                required
                className="w-full text-sm sm:text-base bg-slate-900/80 border border-slate-700/70 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-center font-extrabold text-white font-mono tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {/* Satuan */}
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 truncate">
                Satuan
              </label>
              <input
                type="text"
                placeholder="btg / sak / paket"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full text-sm sm:text-base bg-slate-900/80 border border-slate-700/70 rounded-xl px-2.5 py-2 focus:outline-none focus:border-emerald-500 text-center text-slate-200 font-semibold"
              />
            </div>

            {/* Harga Satuan (Rp) */}
            <div className="col-span-12 sm:col-span-6">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 truncate">
                Harga Satuan (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono pointer-events-none">
                  Rp
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                  required
                  className="w-full text-sm sm:text-base bg-slate-900/80 border border-emerald-500/50 rounded-xl pl-8 pr-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 font-bold text-right text-emerald-400 font-mono tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Subtotal Display Box: Elegan, Terbaca Jelas, & Tidak Terpotong */}
          <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/50 px-3.5 py-2.5 rounded-xl border border-emerald-500/20">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Total Estimasi Biaya:
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {qty} {unit || "item"} × {formatRupiah(unitPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono tracking-tight tabular-nums block">
                {formatRupiah(calculatedTotal)}
              </span>
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

        {/* Inline Success Alert Banner */}
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in duration-200">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Berhasil! Catatan tersimpan ke Google Sheets.</span>
          </div>
        )}

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
