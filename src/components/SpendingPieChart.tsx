"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { ExpenseItem } from "@/types/expense";

const SEGMENT_COLORS = ["#10b981", "#f59e0b", "#6366f1", "#f97316", "#06b6d4", "#ec4899", "#84cc16", "#a78bfa", "#64748b"];

export const SpendingPieChart: React.FC<{ expenses: ExpenseItem[] }> = ({ expenses }) => {
  const totals = expenses.reduce<Record<string, number>>((result, item) => {
    const amount = Number(item.totalPrice) || 0;
    if (amount > 0) result[item.category || "Tanpa kategori"] = (result[item.category || "Tanpa kategori"] || 0) + amount;
    return result;
  }, {});
  const rows = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((sum, [, amount]) => sum + amount, 0);
  const slices = rows.map(([category, amount], index) => {
    const start = (rows.slice(0, index).reduce((sum, [, value]) => sum + value, 0) / total) * 100;
    const end = start + (amount / total) * 100;
    return { category, amount, color: SEGMENT_COLORS[index % SEGMENT_COLORS.length], start, end };
  });
  const background = total > 0
    ? `conic-gradient(${slices.map((slice) => `${slice.color} ${slice.start}% ${slice.end}%`).join(", ")})`
    : "conic-gradient(#64748b 0% 100%)";

  return (
    <section className="glass-panel rounded-2xl p-4 sm:p-5" aria-labelledby="spending-chart-title">
      <div className="mb-4">
        <h3 id="spending-chart-title" className="text-base sm:text-lg font-bold text-white">Komposisi Pengeluaran</h3>
        <p className="text-sm text-slate-400">Bagian tiap kategori dari total transaksi tersimpan</p>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-600 p-5 text-center text-sm text-slate-300">
          Belum ada transaksi untuk ditampilkan. Catat pengeluaran agar diagram terisi.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[minmax(150px,200px)_1fr] items-center gap-5">
          <div className="mx-auto grid h-40 w-40 place-items-center rounded-full" role="img" aria-label={`Diagram lingkaran pengeluaran, total ${formatRupiah(total)}`} style={{ background }}>
            <div className="grid h-24 w-24 content-center rounded-full bg-slate-900 text-center">
              <span className="text-xs text-slate-300">Total</span>
              <strong className="px-1 text-sm text-white">{formatRupiah(total)}</strong>
            </div>
          </div>
          <ul className="space-y-2" aria-label="Rincian pengeluaran per kategori">
            {slices.map((slice) => (
              <li key={slice.category} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-start gap-2 text-slate-200">
                  <span className="mt-1.5 h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: slice.color }} aria-hidden="true" />
                  <span className="break-words">{slice.category}</span>
                </span>
                <span className="shrink-0 text-right text-slate-300">
                  <strong className="text-white">{formatRupiah(slice.amount)}</strong>
                  <span className="ml-1 text-slate-400">{Math.round((slice.amount / total) * 100)}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
