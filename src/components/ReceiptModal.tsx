"use client";

import React, { useState } from "react";
import { X, Printer, CheckCircle, Store, Calendar, FileText, User, CreditCard } from "lucide-react";
import { ExpenseItem } from "@/types/expense";
import { formatRupiah, formatDateIndo, angkaTerbilang } from "@/lib/utils";

interface ReceiptModalProps {
  item: ExpenseItem | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  // Editable fields with smart defaults
  const [payerName, setPayerName] = useState("Nahel Al Fath Ichida");
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "Transfer Bank">("Tunai");
  const [receiptNo, setReceiptNo] = useState(() => {
    const cleanDate = (item.date || "").replace(/-/g, "");
    const cleanId = (item.id || "").replace("EXP-", "").slice(-5);
    return `KW/${cleanDate || "2026"}/${cleanId || "001"}`;
  });

  const terbilangText = angkaTerbilang(item.totalPrice || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Print stylesheet to isolate the receipt paper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-kuitansi-wrapper,
          #printable-kuitansi-wrapper * {
            visibility: visible !important;
          }
          #printable-kuitansi-wrapper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20mm !important;
            background: white !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-[#0b101d] text-slate-100 border border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0d1424] flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Cetak Kuitansi Bukti Pembayaran</h3>
              <p className="text-xs text-slate-400">Siap cetak atau simpan ke file PDF ukuran resmi</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg hover:brightness-110 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Edit Options Bar (Hidden on print) */}
        <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 text-xs grid grid-cols-1 sm:grid-cols-3 gap-2.5 no-print">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-400" /> Nama Pembayar:
            </label>
            <input
              type="text"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-emerald-400" /> Metode Bayar:
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="Tunai">Tunai (Cash)</option>
              <option value="Transfer Bank">Transfer Bank</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-emerald-400" /> No. Kuitansi:
            </label>
            <input
              type="text"
              value={receiptNo}
              onChange={(e) => setReceiptNo(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* The Printable Paper Container */}
        <div className="p-4 sm:p-8 overflow-x-auto max-h-[70vh] custom-scrollbar bg-slate-950/40 flex justify-center">
          <div
            id="printable-kuitansi-wrapper"
            className="w-full max-w-[720px] bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-2xl border-2 border-slate-300 relative select-text"
          >
            {/* Traditional Outer Double Border Accent */}
            <div className="border border-slate-400 p-4 sm:p-6 rounded-lg relative">
              
              {/* Header Kop */}
              <div className="border-b-2 border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                    Kuitansi Pembayaran
                  </h2>
                  <p className="text-xs font-semibold text-slate-700">
                    Proyek Pembangunan Rumah Tinggal Nahel Al Fath
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Jl. Petani Gg. Ibrahim, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1 rounded text-xs font-mono font-bold text-slate-800">
                    {receiptNo}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tanggal: {formatDateIndo(item.date)}
                  </p>
                </div>
              </div>

              {/* Body Content */}
              <div className="py-5 space-y-3.5 text-xs sm:text-sm">
                {/* Telah Terima Dari */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                    Telah Terima Dari
                  </div>
                  <div className="sm:col-span-9 font-extrabold text-slate-900 border-b border-dashed border-slate-400 pb-1">
                    : {payerName}
                  </div>
                </div>

                {/* Uang Sejumlah (Terbilang) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-start">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs pt-1">
                    Uang Sejumlah
                  </div>
                  <div className="sm:col-span-9 bg-slate-100 border border-slate-300 rounded-lg p-2.5 font-bold italic text-slate-800 text-xs sm:text-sm leading-relaxed">
                    # {terbilangText} #
                  </div>
                </div>

                {/* Untuk Pembayaran */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-start">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs pt-1">
                    Untuk Pembayaran
                  </div>
                  <div className="sm:col-span-9 space-y-1 border-b border-dashed border-slate-400 pb-2">
                    <p className="font-extrabold text-slate-900">
                      : {item.itemName}
                    </p>
                    <p className="text-xs text-slate-600 pl-2">
                      • Rincian: {item.qty} {item.unit} × {formatRupiah(item.unitPrice)}
                    </p>
                    <p className="text-xs text-slate-600 pl-2">
                      • Pos Anggaran: {item.category}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-slate-500 pl-2 italic">
                        • Catatan: {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Penerima / Toko */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 items-baseline">
                  <div className="sm:col-span-3 font-bold text-slate-700 uppercase text-xs">
                    Penerima / Vendor
                  </div>
                  <div className="sm:col-span-9 font-bold text-slate-800 border-b border-dashed border-slate-400 pb-1">
                    : {item.vendor || "Toko / Mandor Lapangan"} ({paymentMethod})
                  </div>
                </div>
              </div>

              {/* Bottom Row: Amount Box, Stamp, & Signatures */}
              <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                {/* Total Box & Status Stamp */}
                <div className="sm:col-span-6 space-y-2">
                  <div className="inline-block bg-slate-900 text-white px-4 py-2.5 rounded-lg border-2 border-slate-800 shadow-md">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                      Terbilang Angka (Total):
                    </span>
                    <span className="text-lg sm:text-xl font-black font-mono tracking-tight text-white">
                      {formatRupiah(item.totalPrice)}
                    </span>
                  </div>

                  {/* Stamp Badge */}
                  <div className="flex items-center gap-2">
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-md border-2 font-black text-xs uppercase tracking-widest ${
                      item.paymentStatus === "Bon / Tempo"
                        ? "border-amber-600 text-amber-700 bg-amber-50"
                        : "border-emerald-600 text-emerald-700 bg-emerald-50"
                    }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {item.paymentStatus === "Bon / Tempo" ? "BON / TEMPO" : "LUNAS"}
                    </div>
                    <span className="text-[10px] text-slate-400 italic">Valid & Sah</span>
                  </div>
                </div>

                {/* Signature Columns */}
                <div className="sm:col-span-6 grid grid-cols-2 gap-3 text-center">
                  {/* Yang Menyerahkan */}
                  <div>
                    <p className="text-[11px] text-slate-600 font-semibold mb-12">
                      Yang Menyerahkan,
                    </p>
                    <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1">
                      {payerName}
                    </p>
                  </div>

                  {/* Yang Menerima */}
                  <div>
                    <p className="text-[11px] text-slate-600 font-semibold mb-12">
                      Pontianak, {formatDateIndo(item.date)}<br />
                      Penerima,
                    </p>
                    <p className="font-bold text-xs text-slate-900 border-t border-slate-400 pt-1 truncate">
                      {item.vendor || "Toko / Mandor"}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="p-3 bg-[#0d1424] border-t border-slate-800 text-center text-xs text-slate-400 no-print">
          Tips: Pada dialog print browser, pilih opsi <span className="text-emerald-400 font-semibold">"Save as PDF"</span> untuk mengunduh kuitansi ke file PDF di HP atau laptop Anda.
        </div>
      </div>
    </div>
  );
};
