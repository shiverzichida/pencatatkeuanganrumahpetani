"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetSummary } from "@/components/BudgetSummary";
import { ExpenseList } from "@/components/ExpenseList";
import { SettingsModal } from "@/components/SettingsModal";
import { MaterialCalculatorModal } from "@/components/MaterialCalculatorModal";
import { LaborWeeklyRecapModal } from "@/components/LaborWeeklyRecapModal";
import { ReceiptModal } from "@/components/ReceiptModal";
import { CategoriesModal } from "@/components/CategoriesModal";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import { ExpenseItem, BudgetCategory, DEFAULT_BUDGETS, INITIAL_EXPENSES, CATEGORIES } from "@/types/expense";
import { Home, RefreshCw, Settings, Database, FileSpreadsheet, PlusCircle, LayoutDashboard, ListOrdered, CheckCircle2, Hammer, ClipboardList, Sun, Moon, Tags } from "lucide-react";

export const DEFAULT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwIJPWHwKL36YxZ6mPNo6gS8Rwu_mBOxT5qoB5to0l0AJV4qZLrZWoo4QmbzYxXHRuU_w/exec";

export default function HomePage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [budgets, setBudgets] = useState<BudgetCategory[]>(DEFAULT_BUDGETS);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [scriptUrl, setScriptUrl] = useState<string>(DEFAULT_SCRIPT_URL);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isLaborRecapOpen, setIsLaborRecapOpen] = useState<boolean>(false);
  const [recapReceiptItem, setRecapReceiptItem] = useState<ExpenseItem | null>(null);
  const [prefillData, setPrefillData] = useState<{
    category?: string;
    itemName?: string;
    qty?: number;
    unit?: string;
    unitPrice?: number;
    notes?: string;
    weekNo?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"synced" | "local" | "syncing" | "error">("syncing");
  const [toast, setToast] = useState<{ message: string; type?: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // Mobile Tab state: 'dashboard' | 'form' | 'list'
  const [mobileTab, setMobileTab] = useState<"dashboard" | "form" | "list">("dashboard");

  // Load initial settings & local data
  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme");
    const savedCategoriesRaw = localStorage.getItem("custom_categories");
    window.setTimeout(() => {
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
      try {
        const savedCategories: unknown = JSON.parse(savedCategoriesRaw || "[]");
        if (Array.isArray(savedCategories)) setCustomCategories(savedCategories.filter((value): value is string => typeof value === "string"));
      } catch (error) {
        console.error("Gagal membaca kategori kustom", error);
      }
    }, 0);
    const savedUrl = localStorage.getItem("gapps_script_url") || DEFAULT_SCRIPT_URL;
    setScriptUrl(savedUrl);

    const savedExpenses = localStorage.getItem("local_expenses");
    if (savedExpenses) {
      try {
        const parsed = JSON.parse(savedExpenses);
        setExpenses(parsed);
        if (Array.isArray(parsed)) {
          const extraCats = parsed
            .map((item: any) => item.category)
            .filter((c: any) => typeof c === "string" && c.trim() && !CATEGORIES.includes(c as any));
          if (extraCats.length > 0) {
            setCustomCategories((prev) => Array.from(new Set([...prev, ...extraCats])));
          }
        }
      } catch (e) {
        console.error("Failed to parse local expenses", e);
      }
    }

    if (savedUrl) {
      fetchSpreadsheetData(savedUrl);
    }
  }, []);

  // Gabungkan kategori bawaan, kategori kustom, serta kategori dari transaksi & budget Google Sheets
  const categories = useMemo(() => {
    const set = new Set<string>(CATEGORIES);
    customCategories.forEach((c) => {
      if (c && c.trim()) set.add(c.trim());
    });
    expenses.forEach((e) => {
      if (e.category && e.category.trim()) set.add(e.category.trim());
    });
    budgets.forEach((b) => {
      if (b.category && b.category.trim()) set.add(b.category.trim());
    });
    return Array.from(set);
  }, [customCategories, expenses, budgets]);

  const handleAddCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = Array.from(new Set([...customCategories, trimmed]));
    setCustomCategories(next);
    localStorage.setItem("custom_categories", JSON.stringify(next));
    showToast(`✓ Kategori "${trimmed}" berhasil ditambahkan!`);

    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "add_category",
            category: trimmed,
          }),
        });
      } catch (err) {
        console.error("Gagal sinkronkan kategori ke Google Spreadsheet", err);
      }
    }
  };

  const handleRemoveCategory = async (name: string) => {
    const next = customCategories.filter((c) => c !== name);
    setCustomCategories(next);
    localStorage.setItem("custom_categories", JSON.stringify(next));
    showToast(`Kategori "${name}" dihapus.`, "info");

    if (scriptUrl) {
      try {
        await fetch(scriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify({
            action: "delete_category",
            category: name,
          }),
        });
      } catch (err) {
        console.error("Gagal hapus kategori di Google Spreadsheet", err);
      }
    }
  };
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("app_theme", next);
  };

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

        // Auto-sinkronisasi kategori dari Google Spreadsheet (transaksi & budget sheet)
        const sheetCategories = new Set<string>();
        json.data.forEach((item: ExpenseItem) => {
          if (item.category && typeof item.category === "string" && item.category.trim()) {
            sheetCategories.add(item.category.trim());
          }
        });
        if (Array.isArray(json.budgets)) {
          json.budgets.forEach((b: { category: string }) => {
            if (b.category && typeof b.category === "string" && b.category.trim()) {
              sheetCategories.add(b.category.trim());
            }
          });
        }

        setCustomCategories((prev) => {
          const nonDefaultSheetCats = Array.from(sheetCategories).filter(
            (c) => !CATEGORIES.includes(c as typeof CATEGORIES[number])
          );
          const combined = Array.from(new Set([...prev, ...nonDefaultSheetCats]));
          localStorage.setItem("custom_categories", JSON.stringify(combined));
          return combined;
        });

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

  const handleAddExpense = async (newExpData: Omit<ExpenseItem, "id" | "createdAt">) => {
    const newId = "EXP-" + new Date().getTime();
    const newExpense: ExpenseItem = {
      ...newExpData,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem("local_expenses", JSON.stringify(updated));
    showToast("✓ Pengeluaran baru berhasil disimpan!");

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

  const handleUpdateExpense = async (updatedExp: ExpenseItem) => {
    const updatedList = expenses.map((item) =>
      item.id === updatedExp.id ? updatedExp : item
    );
    setExpenses(updatedList);
    localStorage.setItem("local_expenses", JSON.stringify(updatedList));
    showToast("✓ Perubahan berhasil disimpan!");

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

  const handleDeleteExpense = async (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    localStorage.setItem("local_expenses", JSON.stringify(updated));
    showToast("Catatan pengeluaran telah dihapus.", "info");

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

  const handleTogglePaymentStatus = async (item: ExpenseItem) => {
    const nextStatus: "Lunas" | "Bon / Tempo" =
      item.paymentStatus === "Bon / Tempo" ? "Lunas" : "Bon / Tempo";
    await handleUpdateExpense({
      ...item,
      paymentStatus: nextStatus,
    });
    showToast(`Status diubah jadi: ${nextStatus}`);
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
    <div data-theme={theme} className="app-shell min-h-screen bg-[#080c15] text-slate-100 pb-24 md:pb-16 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-500/50 bg-[#0c1222] text-white animate-in fade-in slide-in-from-top-3 duration-200">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              toast.type === "error"
                ? "bg-rose-500/20 text-rose-400"
                : toast.type === "info"
                ? "bg-slate-700 text-slate-300"
                : "bg-emerald-500/25 text-emerald-400"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-100">{toast.message}</span>
        </div>
      )}

      {/* Top Header Glass */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#080c15]/90 border-b border-slate-800/80">
        <div className="max-w-7xl xl:max-w-[1380px] mx-auto px-4 py-3 flex items-center justify-between max-sm:flex-wrap gap-y-2">
          <div className="flex items-center gap-2.5 max-sm:w-full">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Bangun Rumah
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Nahel
                </span>
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                Jl. Petani Gg. Ibrahim, Pontianak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between max-sm:gap-1">
            <button type="button" onClick={toggleTheme} aria-label={`Aktifkan mode ${theme === "dark" ? "terang" : "gelap"}`} className="min-h-11 min-w-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-slate-200 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-400" title={`Mode ${theme === "dark" ? "terang" : "gelap"}`}>
              {theme === "dark" ? <Sun className="mx-auto h-5 w-5" /> : <Moon className="mx-auto h-5 w-5" />}
            </button>
            <button type="button" onClick={() => setIsCategoriesOpen(true)} className="min-h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm font-semibold text-slate-200 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-400 flex items-center gap-2" title="Kelola kategori">
              <Tags className="h-4 w-4" /><span className="hidden sm:inline">Kategori</span>
            </button>
            {/* Status Sync Badge */}
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="cursor-pointer hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-card hover:bg-white/[0.06] transition-colors"
            >
              {syncStatus === "synced" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-300">Sheets Terhubung</span>
                </>
              ) : syncStatus === "syncing" ? (
                <>
                  <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                  <span className="text-amber-300">Sinkron...</span>
                </>
              ) : syncStatus === "error" ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-rose-300">Gagal Sinkron</span>
                </>
              ) : (
                <>
                  <Database className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-400">Mode Lokal</span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            {scriptUrl && (
              <button
                onClick={() => fetchSpreadsheetData(scriptUrl)}
                disabled={isLoading}
                title="Tarik Data Terbaru dari Spreadsheet"
                className="p-2 glass-card hover:bg-white/[0.08] text-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
              </button>
            )}

            {/* Tombol Rekap Upah Tukang (KJ) */}
            <button
              onClick={() => setIsLaborRecapOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 rounded-xl transition-all cursor-pointer"
              title="Rekapitulasi Pembayaran Mingguan Jasa Bangun (Spreadsheet)"
            >
              <Hammer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Rekap Upah Tukang</span>
              <span className="sm:hidden">Rekap KJ</span>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 rounded-xl shadow-md transition-all cursor-pointer glow-emerald"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl xl:max-w-[1380px] mx-auto px-3.5 sm:px-6 mt-4 sm:mt-6 space-y-4 sm:space-y-6">
        {/* Banner Target Budget & Tukang */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                RAB 2 Lantai
              </span>
              <span className="text-[11px] text-slate-400">Pondasi 1 Lt (37,5 m²) + 2 Lt (80 m²)</span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              Target Bangun: Rp 357 Juta (Pesimis: Rp 381,6 Juta)
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Jasa Tukang Pemborongan Terkunci: <span className="text-emerald-400 font-bold">Rp 110.000.000,-</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setIsLaborRecapOpen(true)}
              className="text-xs font-bold px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl transition-colors border border-amber-500/40 flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
              Rekap Mingguan Tukang →
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs font-medium px-3 py-1.5 glass-card hover:bg-white/[0.08] text-slate-300 rounded-xl transition-colors border border-white/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              Koneksi Sheets
            </button>
          </div>
        </div>

        {/* Mobile Navigation Segmented Tabs (Visible on screens < lg) */}
        <div className="flex lg:hidden bg-slate-900/80 p-1 rounded-2xl border border-white/10 glass-panel">
          <button
            onClick={() => setMobileTab("dashboard")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "dashboard"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Ringkasan
          </button>
          <button
            onClick={() => setMobileTab("form")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "form"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {editingExpense ? "Edit" : "+ Input"}
          </button>
          <button
            onClick={() => setMobileTab("list")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              mobileTab === "list"
                ? "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Riwayat ({expenses.length})
          </button>
        </div>

        {/* Desktop Layout Grid (Visible always on lg, controlled by tabs on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Budget Summary */}
          <div className={`lg:col-span-6 xl:col-span-7 space-y-6 ${mobileTab !== "dashboard" ? "hidden lg:block" : ""}`}>
            <BudgetSummary
              expenses={expenses}
              budgets={budgets}
              onOpenLaborRecap={() => setIsLaborRecapOpen(true)}
            />
            <SpendingPieChart expenses={expenses} />
          </div>

          {/* Right Column: Expense Form */}
          <div className={`lg:col-span-6 xl:col-span-5 ${mobileTab !== "form" ? "hidden lg:block" : ""}`}>
            <div className="sticky top-20">
              <ExpenseForm
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                editingExpense={editingExpense}
                onCancelEdit={() => {
                  setEditingExpense(null);
                  setPrefillData(null);
                }}
                onOpenCalculator={() => setIsCalcOpen(true)}
                prefillData={prefillData}
                isLoading={isLoading}
                categories={categories}
              />
            </div>
          </div>
        </div>

        {/* Expense History List (Always visible on desktop, tab-controlled on mobile) */}
        <div className={`space-y-3 pt-2 ${mobileTab !== "list" ? "hidden lg:block" : ""}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              Riwayat Pengeluaran
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/20">
                {expenses.length} transaksi
              </span>
            </h3>
          </div>

          <ExpenseList
            expenses={expenses}
            onDeleteExpense={handleDeleteExpense}
            onEditExpense={(item) => {
              setPrefillData(null);
              setEditingExpense(item);
              setMobileTab("form");
              window.scrollTo({ top: 120, behavior: "smooth" });
            }}
            onTogglePaymentStatus={handleTogglePaymentStatus}
            isLoading={isLoading}
            categories={categories}
          />
        </div>
      </main>

      {/* Floating Bottom Bar for Quick Mobile Access */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-t border-white/10 px-6 py-2.5 flex items-center justify-around">
        <button
          onClick={() => setMobileTab("dashboard")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            mobileTab === "dashboard" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Budget</span>
        </button>

        <button
          onClick={() => setMobileTab("form")}
          className="flex flex-col items-center -mt-5 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg glow-emerald font-bold">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1">Catat</span>
        </button>

        <button
          onClick={() => setMobileTab("list")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold cursor-pointer ${
            mobileTab === "list" ? "text-emerald-400" : "text-slate-400"
          }`}
        >
          <ListOrdered className="w-5 h-5" />
          <span>Riwayat</span>
        </button>
      </div>

      {/* Material Quick Calculator Modal */}
      <MaterialCalculatorModal
        isOpen={isCalcOpen}
        onClose={() => setIsCalcOpen(false)}
        onApplyCalculation={(data) => {
          setPrefillData(data);
          setMobileTab("form");
          setIsCalcOpen(false);
          window.scrollTo({ top: 120, behavior: "smooth" });
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        scriptUrl={scriptUrl}
        onSaveUrl={handleSaveScriptUrl}
      />

      <CategoriesModal
        isOpen={isCategoriesOpen}
        categories={categories}
        customCategories={customCategories}
        onClose={() => setIsCategoriesOpen(false)}
        onAdd={handleAddCategory}
        onRemove={handleRemoveCategory}
      />

      {/* Rekapitulasi Pembayaran Mingguan Jasa Bangun (Spreadsheet) Modal */}
      <LaborWeeklyRecapModal
        isOpen={isLaborRecapOpen}
        onClose={() => setIsLaborRecapOpen(false)}
        expenses={expenses}
        onAddNewWeek={(nextWeek) => {
          setPrefillData({
            category: "Jasa Tukang Borongan",
            itemName: "Upah tenaga kerja pembangunan rumah",
            qty: 3,
            unit: "pekerja",
            unitPrice: 1000000,
            weekNo: nextWeek,
          });
          setMobileTab("form");
          window.scrollTo({ top: 120, behavior: "smooth" });
        }}
        onPrintKJ={(item) => {
          setRecapReceiptItem(item);
        }}
      />

      {/* Modal Kuitansi KJ jika diklik dari tabel rekapitulasi */}
      {recapReceiptItem && (
        <ReceiptModal
          item={recapReceiptItem}
          onClose={() => setRecapReceiptItem(null)}
        />
      )}
    </div>
  );
}
