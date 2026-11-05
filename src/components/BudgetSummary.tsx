"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { Wallet, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { BudgetCategory, ExpenseItem } from "@/types/expense";

interface BudgetSummaryProps {
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ expenses, budgets }) => {
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalPessimistic = budgets.reduce((sum, b) => sum + b.pessimistic, 0);

  const remainingBudget = totalBudget - totalSpent;
  const percentageSpent = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  // Early Warning Thresholds (Fitur #4)
  const isNearBudgetLimit = percentageSpent >= 85 && percentageSpent < 100;
  const isOverBudget = totalSpent > totalBudget;
  const isOverPessimistic = totalSpent > totalPessimistic;

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
      isOver: spent > b.budget,
    };
  });

  return (
    <div className="space-y-4">
      {/* Fitur #4: Early Warning System Banner */}
      {isOverPessimistic ? (
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-300">
              Peringatan Keras: Anggaran Melebihi Batas Pesimis!
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Total belanja telah melampaui batas toleransi pesimis +10% ({formatRupiah(totalPessimistic)}). Mohon evaluasi pos finishing/MEP.
            </p>
          </div>
        </div>
      ) : isOverBudget ? (
        <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-300">
              Peringatan: Anggaran Melewati Target Standar
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Pengeluaran kini memasuki zona cadangan pesimis (Sisa cadangan: {formatRupiah(totalPessimistic - totalSpent)}).
            </p>
          </div>
        </div>
      ) : isNearBudgetLimit ? (
        <div className="glass-panel p-3 sm:p-3.5 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-indigo-200">
              Perhatian: 85% Anggaran Telah Terpakai
            </h4>
            <p className="text-[11px] text-slate-300">
              Sisa anggaran tersisa {formatRupiah(remainingBudget)}. Pastikan pekerjaan struktur inti telah selesai sebelum belanja finishing.
            </p>
          </div>
        </div>
      ) : null}

      {/* 3 Main Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Terpakai */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Terpakai</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">{formatRupiah(totalSpent)}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-bold">{percentageSpent}%</span> dari Target Standar
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Target Budget Standar */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Budget Standar</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">{formatRupiah(totalBudget)}</h3>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5 truncate">
                Sisa: {formatRupiah(remainingBudget)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Pagu Pesimis (+10%) */}
        <div className="glass-panel p-4 rounded-2xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Batas Pesimis (+10%)</p>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">{formatRupiah(totalPessimistic)}</h3>
              <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                Batas Aman Inflasi Bahan
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Keseluruhan */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl">
        <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 font-semibold">
            Realisasi Anggaran Total
          </span>
          <span className="font-extrabold text-white text-sm">{percentageSpent}%</span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentageSpent > 90
                ? "bg-gradient-to-r from-rose-500 to-rose-400"
                : percentageSpent > 70
                ? "bg-gradient-to-r from-amber-500 to-amber-400"
                : "bg-gradient-to-r from-emerald-500 to-teal-400"
            }`}
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 mt-2.5">
          <span>0%</span>
          <span className="text-slate-300">Target: {formatRupiah(totalBudget)}</span>
          <span className="text-amber-400">Pesimis: {formatRupiah(totalPessimistic)}</span>
        </div>
      </div>

      {/* Breakdown per Kategori */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
          <span>Rincian Budget per Kategori</span>
          <span className="text-[10px] text-slate-500 font-normal">Realisasi vs Target</span>
        </h4>
        <div className="space-y-3.5">
          {spendingByCategory.map((cat) => (
            <div key={cat.category} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200 truncate pr-2 group-hover:text-white transition-colors flex items-center gap-1.5">
                  {cat.isCategoryDanger ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  ) : cat.isCategoryWarning ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  ) : null}
                  {cat.category}
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
              <div className="flex items-center justify-between text-[10px] text-slate-400">
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
          ))}
        </div>
      </div>
    </div>
  );
};
