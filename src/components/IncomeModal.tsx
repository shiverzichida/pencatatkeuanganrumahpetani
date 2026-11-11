"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Landmark,
  PlusCircle,
  Edit3,
  Trash2,
  X,
  Calendar,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
} from "lucide-react";
import { IncomeItem } from "@/types/expense";
import { formatDateForInput, formatDateIndo, formatRupiah } from "@/lib/utils";

interface IncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomes: IncomeItem[];
  totalExpenses: number;
  onAddIncome: (income: Omit<IncomeItem, "id" | "createdAt">) => Promise<void>;
  onUpdateIncome: (income: IncomeItem) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_ACCOUNT = "BCA Audi";
const QUICK_AMOUNTS = [1000000, 5000000, 10000000, 25000000, 50000000];

export const IncomeModal: React.FC<IncomeModalProps> = ({
  isOpen,
  onClose,
  incomes,
  totalExpenses,
  onAddIncome,
  onUpdateIncome,
  onDeleteIncome,
  isLoading,
}) => {
  const [date, setDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
  const [error, setError] = useState<string>("");
  const descInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setAmount(0);
    setNotes("");
    setEditingIncome(null);
    setError("");
  };

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalIncome = incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const balance = totalIncome - totalExpenses;

  const sortedIncomes = [...incomes].sort((a, b) => {
    const timeA = new Date(a.date).getTime() || 0;
    const timeB = new Date(b.date).getTime() || 0;
    if (timeA !== timeB) return timeB - timeA;
    return (b.id || "").localeCompare(a.id || "");
  });

  const handleStartEdit = (item: IncomeItem) => {
    setEditingIncome(item);
    setDate(formatDateForInput(item.date) || new Date().toISOString().split("T")[0]);
    setDescription(item.description || "");
    setAmount(Number(item.amount) || 0);
    setNotes(item.notes || "");
    setError("");
    descInputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setError("Sumber / keterangan uang masuk wajib diisi.");
      return;
    }
    if (!amount || amount <= 0) {
      setError("Nominal uang masuk harus lebih dari Rp 0.");
      return;
    }

    const payload = {
      date: date || new Date().toISOString().split("T")[0],
      account: DEFAULT_ACCOUNT,
      description: trimmedDesc,
      amount: Number(amount),
      notes: notes.trim(),
    };

    if (editingIncome) {
      await onUpdateIncome({
        ...editingIncome,
        ...payload,
      });
    } else {
      await onAddIncome(payload);
    }
    resetForm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="income-modal-title"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 id="income-modal-title" className="text-base sm:text-lg font-bold text-white">
                Uang Masuk & Saldo BCA Audi
              </h2>
              <p className="text-xs text-slate-400">
                Catat dana masuk untuk memantau saldo BCA Audi (Uang Masuk − Total Pengeluaran)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal uang masuk"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {/* Saldo & Ringkasan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="glass-panel-subtle rounded-xl p-3 border border-emerald-500/25">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                Total Uang Masuk
              </p>
              <p className="text-base font-extrabold text-emerald-400 mt-1">
                {formatRupiah(totalIncome)}
              </p>
            </div>

            <div className="glass-panel-subtle rounded-xl p-3 border border-white/10">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                Total Pengeluaran
              </p>
              <p className="text-base font-extrabold text-white mt-1">
                {formatRupiah(totalExpenses)}
              </p>
            </div>

            <div
              className={`glass-panel-subtle rounded-xl p-3 border ${
                balance >= 0 ? "border-emerald-500/40" : "border-rose-500/40"
              }`}
            >
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                Saldo BCA Audi
              </p>
              <p
                className={`text-base font-black mt-1 ${
                  balance >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {formatRupiah(balance)}
              </p>
            </div>
          </div>

          {/* Form Tambah / Edit Uang Masuk */}
          <form onSubmit={handleSubmit} className="glass-panel-subtle rounded-2xl p-4 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                {editingIncome ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    Edit Catatan Uang Masuk
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Tambah Uang Masuk ({DEFAULT_ACCOUNT})
                  </>
                )}
              </h3>
              {editingIncome && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Tanggal Masuk</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-sm px-3 py-2 glass-input rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 mb-1 block">Rekening</label>
                <input
                  type="text"
                  value={DEFAULT_ACCOUNT}
                  readOnly
                  className="w-full text-sm px-3 py-2 glass-input rounded-xl opacity-80 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">
                Sumber / Keterangan Uang Masuk
              </label>
              <input
                ref={descInputRef}
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError("");
                }}
                placeholder="Contoh: Transfer dana bangun tahap 1 / Gaji / Tabungan"
                className="w-full text-sm px-3 py-2 glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Nominal Uang Masuk (Rp)</label>
                <span className="text-xs font-bold text-emerald-400">{formatRupiah(amount || 0)}</span>
              </div>
              <input
                type="number"
                min={0}
                step="any"
                value={amount || ""}
                onChange={(e) => {
                  setAmount(Number(e.target.value) || 0);
                  setError("");
                }}
                placeholder="0"
                className="w-full text-sm px-3 py-2 glass-input rounded-xl focus:outline-none font-mono"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_AMOUNTS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setAmount((prev) => (prev || 0) + preset);
                      setError("");
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    + {preset / 1000000} Jt
                  </button>
                ))}
                {amount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmount(0)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-white/10 transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Catatan (Opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan bila ada..."
                className="w-full text-sm px-3 py-2 glass-input rounded-xl focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs font-semibold text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {editingIncome ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  Simpan Perubahan Uang Masuk
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Simpan Uang Masuk (BCA Audi)
                </>
              )}
            </button>
          </form>

          {/* Riwayat Uang Masuk */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Riwayat Uang Masuk BCA Audi ({sortedIncomes.length})
            </h3>
            {sortedIncomes.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-600 p-5 text-center text-sm text-slate-400">
                Belum ada catatan uang masuk di rekening BCA Audi.
              </p>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                {sortedIncomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-3.5 border-b border-white/10 last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-white/[0.02]"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {inc.account || DEFAULT_ACCOUNT}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateIndo(inc.date)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white break-words">{inc.description}</p>
                      {inc.notes && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <FileText className="w-3 h-3 shrink-0" />
                          <span className="break-words">{inc.notes}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <span className="text-sm font-black font-mono text-emerald-400">
                        + {formatRupiah(Number(inc.amount) || 0)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(inc)}
                          disabled={isLoading}
                          title="Edit Uang Masuk"
                          aria-label={`Edit uang masuk ${inc.description}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/15 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Hapus catatan uang masuk "${inc.description}" (${formatRupiah(
                                  Number(inc.amount) || 0
                                )})?`
                              )
                            ) {
                              onDeleteIncome(inc.id);
                            }
                          }}
                          disabled={isLoading}
                          title="Hapus Uang Masuk"
                          aria-label={`Hapus uang masuk ${inc.description}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
