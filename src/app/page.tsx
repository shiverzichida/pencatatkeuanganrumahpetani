"use client";

import React, { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetSummary } from "@/components/BudgetSummary";
import { ExpenseList } from "@/components/ExpenseList";
import { SettingsModal } from "@/components/SettingsModal";
import { ExpenseItem, BudgetCategory, DEFAULT_BUDGETS, INITIAL_EXPENSES } from "@/types/expense";
import { Home, RefreshCw, Settings, Database, FileSpreadsheet } from "lucide-react";

export default function HomePage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(DEFAULT_BUDGETS);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [scriptUrl, setScriptUrl] = useState<string>("");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "local" | "syncing" | "error">("local");

  // Load initial settings & local data
  useEffect(() => {
    const savedUrl = localStorage.getItem("gapps_script_url") || "";
    setScriptUrl(savedUrl);

    const savedExpenses = localStorage.getItem("local_expenses");
    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error("Failed to parse local expenses", e);
      }
    }

    if (savedUrl) {
      fetchSpreadsheetData(savedUrl);
    }
  }, []);

  // Fetch data from Google Apps Script Web App
  const fetchSpreadsheetData = async (url: string) => {
    if (!url) return;
    setIsLoading(true);
    setSyncStatus("syncing");
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "success" && Array.isArray(json.data) && json.data.length > 0) {
        setExpenses(json.data);
        localStorage.setItem("local_expenses", JSON.stringify(json.data));
        if (Array.isArray(json.budgets) && json.budgets.length > 0) {
          setBudgets(json.budgets);
        }
        setSyncStatus("synced");
      } else {
        setSyncStatus("synced");
      }
    } catch (err) {
      console.error("Gagal sinkronisasi dengan Google Spreadsheet", err);
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  // Add Expense
  const handleAddExpense = async (newExpData: Omit<ExpenseItem, "id" | "createdAt">) => {
    const newId = "EXP-" + new Date().getTime();
    const newExpense: ExpenseItem = {
      ...newExpData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    // Update state & local storage immediately (optimistic UI)
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem("local_expenses", JSON.stringify(updated));

    // Kirim ke Google Spreadsheet jika ada URL
    if (scriptUrl) {
      setIsLoading(true);
      try {
        await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "add",
            data: newExpense,
          }),
        });
        setSyncStatus("synced");
      } catch (err) {
        console.error("Gagal kirim ke Google Spreadsheet", err);
        setSyncStatus("error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Update Expense (Edit)
  const handleUpdateExpense = async (updatedExp: ExpenseItem) => {
    const updatedList = expenses.map((item) =>
      item.id === updatedExp.id ? updatedExp : item
    );
    setExpenses(updatedList);
    localStorage.setItem("local_expenses", JSON.stringify(updatedList));

    if (scriptUrl) {
      setIsLoading(true);
      try {
        await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "edit",
            data: updatedExp,
          }),
        });
        setSyncStatus("synced");
      } catch (err) {
        console.error("Gagal update di Google Spreadsheet", err);
        setSyncStatus("error");
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Delete Expense
  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    localStorage.setItem("local_expenses", JSON.stringify(updated));

    if (editingExpense && editingExpense.id === id) {
      setEditingExpense(null);
    }

    if (scriptUrl) {
      setIsLoading(true);
      try {
        await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "delete",
            id: id,
          }),
        });
        setSyncStatus("synced");
      } catch (err) {
        console.error("Gagal hapus di Google Spreadsheet", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveScriptUrl = (url: string) => {
    setScriptUrl(url);
    localStorage.setItem("gapps_script_url", url);
    if (url) {
      fetchSpreadsheetData(url);
    } else {
      setSyncStatus("local");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-16 font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight">
                Pencatatan Bangun Rumah
              </h1>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Nahel Al Fath Ichida</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">Jl. Petani Gg. Ibrahim</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Sync Badge */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="cursor-pointer hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 hover:bg-slate-700/80 transition-colors"
            >
              {syncStatus === "synced" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">Spreadsheet Terhubung</span>
                </>
              ) : syncStatus === "syncing" ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300">Menyinkronkan...</span>
                </>
              ) : syncStatus === "error" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-rose-300">Gagal Sinkron</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">Mode Lokal (Klik hubungkan Sheets)</span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            {scriptUrl && (
              <button
                onClick={() => fetchSpreadsheetData(scriptUrl)}
                disabled={isLoading}
                title="Tarik Data Terbaru dari Spreadsheet"
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Google Sheets</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 mt-6 space-y-6">
        {/* Info Banner Denah & Target */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                Rencana Anggaran Biaya (RAB)
              </span>
              <span className="text-xs text-slate-400">Pondasi 1 Lt (37,5 m²) + 2 Lt (80 m²)</span>
            </div>
            <h2 className="text-lg font-bold">
              Target Biaya Total Bangun: Rp 357 Juta (Pesimis: Rp 381,6 Juta)
            </h2>
            <p className="text-xs text-slate-300">
              Jasa Tukang Pemborongan Terkunci Rp 110.000.000,- (Sesuai Kontrak Kerja).
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs font-medium px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Pengaturan Spreadsheet
            </button>
          </div>
        </div>

        {/* Dashboard Grid: Budget Summary (Left) & Form Input (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <BudgetSummary expenses={expenses} budgets={budgets} />
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-20">
              <ExpenseForm
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                editingExpense={editingExpense}
                onCancelEdit={() => setEditingExpense(null)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Expense History List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Riwayat Pengeluaran
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {expenses.length} transaksi
              </span>
            </h3>
          </div>

          <ExpenseList
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={(item) => {
              setEditingExpense(item);
              window.scrollTo({ top: 150, behavior: "smooth" });
            }}
            isLoading={isLoading}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scriptUrl={scriptUrl}
        onSaveUrl={handleSaveScriptUrl}
      />
    </div>
  );
}
