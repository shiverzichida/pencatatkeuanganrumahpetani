"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";

interface CategoriesModalProps {
  isOpen: boolean;
  categories: string[];
  customCategories: string[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({ isOpen, categories, customCategories, onClose, onAdd, onRemove }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Tab") {
        const dialog = document.querySelector<HTMLElement>("[role=dialog]");
        const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = name.trim().replace(/\s+/g, " ");
    if (value.length < 2) return setError("Nama kategori minimal 2 karakter.");
    if (categories.some((category) => category.toLocaleLowerCase("id-ID") === value.toLocaleLowerCase("id-ID"))) {
      return setError("Kategori tersebut sudah tersedia.");
    }
    onAdd(value);
    setName("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="categories-title" className="glass-panel max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl p-5 sm:p-6">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 id="categories-title" className="text-lg font-bold text-white">Kategori Pengeluaran</h2>
            <p className="mt-1 text-sm text-slate-400">Tambahkan kategori untuk pilihan saat mencatat transaksi.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup" className="rounded-lg p-2 text-slate-300 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-400"><X className="h-5 w-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor="new-category" className="block text-sm font-semibold text-slate-200">Nama kategori baru</label>
          <div className="flex gap-2">
            <input ref={inputRef} id="new-category" value={name} onChange={(event) => { setName(event.target.value); setError(""); }} maxLength={48} className="glass-input min-w-0 flex-1 rounded-xl px-3 py-2.5 text-base" placeholder="Contoh: Bibit dan pupuk" />
            <button type="submit" className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 font-bold text-slate-950 hover:bg-emerald-400"><Plus className="h-4 w-4" />Tambah</button>
          </div>
          {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
        </form>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-200">Kategori tersedia ({categories.length})</h3>
          <ul className="divide-y divide-white/10">
            {categories.map((category) => (
              <li key={category} className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm text-slate-200">
                <span className="break-words">{category}</span>
                {customCategories.includes(category) && <button type="button" onClick={() => onRemove(category)} aria-label={`Hapus kategori ${category}`} className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/10 focus-visible:outline-2 focus-visible:outline-rose-400"><Trash2 className="h-4 w-4" /></button>}
              </li>
            ))}
          </ul>
          {customCategories.length === 0 && <p className="text-sm text-slate-400">Kategori bawaan tetap tersedia. Kategori yang Anda tambahkan dapat dihapus di sini.</p>}
        </div>
      </section>
    </div>
  );
};
