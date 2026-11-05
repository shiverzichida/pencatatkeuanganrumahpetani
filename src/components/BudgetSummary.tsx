"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { Wallet, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BudgetCategory, ExpenseItem } from "@/types/expense";

interface BudgetSummaryProps {
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({ expenses, budgets }) => {
  // Hitung total pengeluaran aktual
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  
  // Total Target Budget
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalPessimistic = budgets.reduce((sum, b) => sum + b.pessimistic, 0);

  const remainingBudget = totalBudget - totalSpent;
  const percentageSpent = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  // Pengeluaran per kategori
  const spendingByCategory = budgets.map((b) => {
    const spent = expenses
      .filter((e) => e.category === b.category)
      .reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const percent = b.budget > 0 ? Math.round((spent / b.budget) * 100) : 0;
    return {
      category: b.category,
      budget: b.budget,
      pessimistic: b.pessimistic,
      spent,
      percent,
      isOver: spent > b.budget,
    };
  });

  return (
    <div className="space-y-4">
      {/* 3 Main Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Terpakai */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Terpakai</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{formatRupiah(totalSpent)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {percentageSpent}% dari Target Standar
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Target Budget Standar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Budget Standar</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{formatRupiah(totalBudget)}</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Sisa: {formatRupiah(remainingBudget)}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Pagu Pesimis (+10%) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagu Pesimis (+10% Bahan)</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{formatRupiah(totalPessimistic)}</h3>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Batas Aman Risiko Material
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Progress Bar Keseluruhan */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
          <span>Realisasi Anggaran Total</span>
          <span className="font-bold text-slate-900">{percentageSpent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentageSpent > 90
                ? "bg-rose-500"
                : percentageSpent > 70
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${percentageSpent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>0%</span>
          <span>Target Standar: {formatRupiah(totalBudget)}</span>
          <span>Batas Pesimis: {formatRupiah(totalPessimistic)}</span>
        </div>
      </div>

      {/* Breakdown per Kategori */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Rincian Budget per Kategori Pekerjaan
        </h4>
        <div className="space-y-3">
          {spendingByCategory.map((cat) => (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 truncate pr-2">
                  {cat.category}
                </span>
                <span className="text-slate-500 flex-shrink-0">
                  <span className="font-bold text-slate-900">{formatRupiah(cat.spent)}</span> /{" "}
                  {formatRupiah(cat.budget)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    cat.isOver
                      ? "bg-rose-500"
                      : cat.percent > 80
                      ? "bg-amber-500"
                      : "bg-indigo-600"
                  }`}
                  style={{ width: `${Math.min(cat.percent, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{cat.percent}% terpakai</span>
                {cat.isOver ? (
                  <span className="text-rose-600 font-semibold flex items-center gap-0.5">
                    <AlertTriangle className="w-3 h-3" /> Melebihi budget ({formatRupiah(cat.spent - cat.budget)})
                  </span>
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
