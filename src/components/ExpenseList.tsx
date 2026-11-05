"use client";

import React, { useState } from "react";
import { formatRupiah, formatDateIndo } from "@/lib/utils";
import { Search, Filter, Trash2, ExternalLink, Calendar, Store, Tag } from "lucide-react";
import { CATEGORIES, ExpenseItem } from "@/types/expense";

interface ExpenseListProps {
  expenses: ExpenseItem[];
  onDeleteExpense: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onDeleteExpense,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeReceiptModal, setActiveReceiptModal] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((item) => {
    const matchSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Search & Filter Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari barang, toko, catatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:w-auto"
          >
            <option value="ALL">Semua Kategori ({expenses.length})</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List / Table */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Tidak ada catatan pengeluaran yang cocok dengan pencarian.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {exp.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateIndo(exp.date)}
                  </span>
                  {exp.vendor && (
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Store className="w-3 h-3 text-slate-400" />
                      {exp.vendor}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{exp.itemName}</h4>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>
                    {exp.qty} {exp.unit} × {formatRupiah(exp.unitPrice)}
                  </span>
                  {exp.notes && (
                    <>
                      <span>•</span>
                      <span className="italic text-slate-400 max-w-xs truncate">{exp.notes}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Price & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{formatRupiah(exp.totalPrice)}</p>
                </div>

                <div className="flex items-center gap-1">
                  {exp.receiptUrl && (
                    <button
                      onClick={() => setActiveReceiptModal(exp.receiptUrl || null)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors title='Lihat Nota'"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Hapus catatan: "${exp.itemName}" (${formatRupiah(exp.totalPrice)})?`)) {
                        onDeleteExpense(exp.id);
                      }
                    }}
                    disabled={isLoading}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors title='Hapus'"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-800">Bukti Nota / Kwitansi</h3>
              <button
                onClick={() => setActiveReceiptModal(null)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200"
              >
                Tutup
              </button>
            </div>
            <div className="overflow-auto rounded-xl border border-slate-200 flex-1 flex items-center justify-center bg-slate-50 p-2">
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
  );
};
