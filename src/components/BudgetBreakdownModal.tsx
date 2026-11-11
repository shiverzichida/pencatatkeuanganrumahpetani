"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X, Layers } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { BudgetCategory, ExpenseItem } from "@/types/expense";

interface BudgetBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
  onOpenLaborRecap?: () => void;
}

export const BudgetBreakdownModal: React.FC<BudgetBreakdownModalProps> = ({
  isOpen,
  onClose,
  expenses,
  budgets,
  onOpenLaborRecap,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const spendingByCategory = budgets.map((b) => {
    const spent = expenses
      .filter((e) => e.category === b.category)
      .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const percent = b.budget > 0 ? Math.round((spent / b.budget) * 100) : 0;
    const isCategoryWarning = percent >= 85 && percent <= 100;
    const isCategoryDanger = spent > b.budget;
    return {
      category: b.category,
      budget: b.budget,
      pessimistic: b.pessimistic,
      spent,
      percent,
      isCategoryWarning,
      isCategoryDanger,
    };
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-breakdown-modal-title"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl max-h-[88vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 id="budget-breakdown-modal-title" className="text-base sm:text-lg font-bold text-white">
                Rincian Budget per Kategori
              </h2>
              <p className="text-xs text-slate-400">Realisasi vs Target tiap kategori pengeluaran</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup rincian budget per kategori"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {spendingByCategory.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-600 p-6 text-center text-sm text-slate-300">
              Belum ada kategori budget yang terdaftar.
            </p>
          ) : (
            spendingByCategory.map((cat) => (
              <div key={cat.category} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-medium text-slate-200 truncate pr-2 group-hover:text-white transition-colors flex items-center gap-1.5">
                    {cat.isCategoryDanger ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
                    ) : cat.isCategoryWarning ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    ) : null}
                    <span className="truncate">{cat.category}</span>
                    {cat.category === "Jasa Tukang Borongan" && onOpenLaborRecap && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClose();
                          onOpenLaborRecap();
                        }}
                        className="ml-1 shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
                      >
                        Rekap KJ →
                      </button>
                    )}
                  </span>
                  <span className="text-slate-400 flex-shrink-0 text-right">
                    <span className="font-bold text-white">{formatRupiah(cat.spent)}</span>
                    <span className="text-slate-500 text-[11px]"> / {formatRupiah(cat.budget)}</span>
                  </span>
                </div>
                <div className="w-full bg-slate-800/70 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.isCategoryDanger
                        ? "bg-rose-500"
                        : cat.percent > 80
                        ? "bg-amber-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${Math.min(cat.percent, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{cat.percent}% terpakai</span>
                  {cat.isCategoryDanger ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                      <AlertTriangle className="w-3 h-3" /> Melebihi budget ({formatRupiah(cat.spent - cat.budget)})
                    </span>
                  ) : cat.isCategoryWarning ? (
                    <span className="text-amber-400 font-medium">Mendekati limit budget</span>
                  ) : (
                    <span>Sisa: {formatRupiah(cat.budget - cat.spent)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-3.5 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-white/10 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
