"use client";

import React, { useState } from "react";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Search, Filter, Trash2, Edit3, ExternalLink, Calendar, Store, Tag, Clock, CheckCircle } from "lucide-react";
import { CATEGORIES, ExpenseItem } from "@/types/expense";

interface ExpenseListProps {
  expenses: ExpenseItem[];
  onDeleteExpense: (id: string) => Promise<void>;
  onEditExpense: (expense: ExpenseItem) => void;
  onTogglePaymentStatus?: (expense: ExpenseItem) => void;
  isLoading: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
  onEditExpense,
  onTogglePaymentStatus,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "Lunas" | "Bon">("ALL");
  const [activeReceiptModal, setActiveReceiptModal] = useState<string | null>(null);

  // Summary Bon / Tempo
  const totalUnpaid = expenses
    .filter((e) => e.paymentStatus === "Bon / Tempo")
    .reduce((sum, e) => sum + (Number(e.totalPrice) || 0), 0);

  const filteredExpenses = expenses.filter((item) => {
    const matchSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchStatus =
      selectedStatus === "ALL" ||
      (selectedStatus === "Bon" && item.paymentStatus === "Bon / Tempo") ||
      (selectedStatus === "Lunas" && (item.paymentStatus === "Lunas" || !item.paymentStatus));
    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-3">
      {/* Alert Banner Utang Toko / Bon (Fitur #3) */}
      {totalUnpaid > 0 && (
        <div className="glass-panel rounded-2xl p-3 sm:p-4 border border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Total Tagihan Belum Lunas (Bon/Tempo)</p>
              <h4 className="text-sm sm:text-base font-extrabold text-white">{formatRupiah(totalUnpaid)}</h4>
            </div>
          </div>
          <button
            onClick={() => setSelectedStatus(selectedStatus === "Bon" ? "ALL" : "Bon")}
            className="text-[11px] px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-xl font-bold transition-all cursor-pointer"
          >
            {selectedStatus === "Bon" ? "Lihat Semua" : "Filter Bon Saja"}
          </button>
        </div>
      )}

      {/* Main List Container */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-xl">
        {/* Search & Filter Header */}
        <div className="p-3.5 sm:p-4 border-b border-white/5 bg-slate-900/50 flex flex-col sm:flex-row gap-2.5 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari barang, toko, catatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="text-xs py-2 px-2.5 glass-input rounded-xl focus:outline-none bg-slate-900 text-white"
            >
              <option value="ALL" className="bg-slate-900">Semua Status</option>
              <option value="Lunas" className="bg-slate-900">Sudah Lunas</option>
              <option value="Bon" className="bg-slate-900">Bon / Tempo</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs py-2 px-3 glass-input rounded-xl focus:outline-none w-full sm:w-auto bg-slate-900 text-white"
            >
              <option value="ALL" className="bg-slate-900">Semua Kategori ({expenses.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List Item */}
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
            Belum ada catatan pengeluaran yang cocok.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 sm:p-4 hover:bg-white/[0.02] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Status Bon / Lunas Pill (Fitur #3) */}
                    <button
                      onClick={() => onTogglePaymentStatus && onTogglePaymentStatus(exp)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 transition-all cursor-pointer ${
                        exp.paymentStatus === "Bon / Tempo"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                      title="Klik untuk ubah status Lunas / Bon"
                    >
                      {exp.paymentStatus === "Bon / Tempo" ? (
                        <>
                          <Clock className="w-2.5 h-2.5" /> Bon
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-2.5 h-2.5" /> Lunas
                        </>
                      )}
                    </button>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-emerald-400" />
                      {exp.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {formatDateIndo(exp.date)}
                    </span>
                    {exp.vendor && (
                      <span className="text-[11px] text-slate-300 font-medium flex items-center gap-1 truncate">
                        <Store className="w-3 h-3 text-slate-500" />
                        {exp.vendor}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {exp.itemName}
                  </h4>

                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    <span className="text-slate-300">
                      {exp.qty} {exp.unit} × {formatRupiah(exp.unitPrice)}
                    </span>
                    {exp.notes && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="italic text-slate-400 text-[11px] truncate">{exp.notes}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <div className="text-right">
                    <p className={`text-sm sm:text-base font-black font-mono tabular-nums tracking-tight ${
                      exp.paymentStatus === "Bon / Tempo" ? "text-amber-400" : "text-emerald-400"
                    }`}>
                      {formatRupiah(exp.totalPrice)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {exp.receiptUrl && (
                      <button
                        onClick={() => setActiveReceiptModal(exp.receiptUrl || null)}
                        className="p-2 text-indigo-400 hover:bg-indigo-500/15 rounded-lg transition-colors cursor-pointer"
                        title="Lihat Foto Nota"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => onEditExpense(exp)}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/15 rounded-lg transition-colors cursor-pointer"
                      title="Edit Transaksi Ini"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus catatan: "${exp.itemName}" (${formatRupiah(exp.totalPrice)})?`)) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      disabled={isLoading}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal View Nota Image */}
        {activeReceiptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="glass-panel rounded-2xl p-4 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-sm text-white">Bukti Nota / Kwitansi</h3>
                <button
                  onClick={() => setActiveReceiptModal(null)}
                  className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>
              <div className="overflow-auto rounded-xl border border-white/10 flex-1 flex items-center justify-center bg-black/40 p-2">
                <img
                  src={activeReceiptModal}
                  alt="Nota Pembelian"
                  className="max-h-[70vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
