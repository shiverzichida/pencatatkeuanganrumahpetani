"use client";

import React from "react";
import { formatRupiah } from "@/lib/utils";
import { Wallet, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, Landmark, PlusCircle } from "lucide-react";
import { BudgetCategory, ExpenseItem, IncomeItem } from "@/types/expense";

interface BudgetSummaryProps {
  expenses: ExpenseItem[];
  budgets: BudgetCategory[];
  incomes?: IncomeItem[];
  onOpenIncomeModal?: () => void;
}

export const BudgetSummary: React.FC<BudgetSummaryProps> = ({
  expenses,
  budgets,
  incomes = [],
  onOpenIncomeModal,
}) => {
  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalSpent = expenses.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
  const totalPessimistic = budgets.reduce((sum, b) => sum + b.pessimistic, 0);

  const remainingBudget = totalBudget - totalSpent;
  const bcaAudiBalance = totalIncome - totalSpent;
  const percentageSpent = Math.min(Math.round((totalSpent / totalBudget) * 100), 100);

  // Early Warning Thresholds (Fitur #4)
  const isNearBudgetLimit = percentageSpent >= 85 && percentageSpent < 100;
  const isOverBudget = totalSpent > totalBudget;
  const isOverPessimistic = totalSpent > totalPessimistic;

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

      {/* Kartu Saldo BCA Audi (Uang Masuk - Total Pengeluaran) */}
      <div
        className={`glass-panel p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden ${
          bcaAudiBalance >= 0 ? "border-emerald-500/30" : "border-rose-500/35"
        }`}
      >
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              bcaAudiBalance >= 0
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400"
            }`}
          >
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Saldo BCA Audi
            </p>
            <h3
              className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 ${
                bcaAudiBalance >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatRupiah(bcaAudiBalance)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>
                Uang Masuk:{" "}
                <strong className="text-emerald-400">{formatRupiah(totalIncome)}</strong>{" "}
                <span className="text-slate-500">({incomes.length}x)</span>
              </span>
              <span className="text-slate-600">•</span>
              <span>
                Keluar: <strong className="text-white">{formatRupiah(totalSpent)}</strong>
              </span>
            </p>
          </div>
        </div>

        {onOpenIncomeModal && (
          <button
            type="button"
            onClick={onOpenIncomeModal}
            className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/35 text-xs font-bold transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            Uang Masuk / Riwayat
          </button>
        )}
      </div>

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
    </div>
  );
};
