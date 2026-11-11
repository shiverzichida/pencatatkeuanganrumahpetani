"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

interface CategoriesModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onAdd: (name: string) => void;
  onEdit: (oldName: string, newName: string) => void;
  onRemove: (name: string) => void;
  expensesCountByCategory?: Record<string, number>;
}

export const CategoriesModal: React.FC<CategoriesModalProps> = ({
  isOpen,
  categories,
  onClose,
  onAdd,
  onEdit,
  onRemove,
  expensesCountByCategory = {},
}) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (editingCategory !== null) {
          setEditingCategory(null);
          setEditingValue("");
          setEditError("");
          return;
        }
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
  }, [isOpen, onClose, editingCategory]);

  useEffect(() => {
    if (editingCategory !== null) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [editingCategory]);

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

  const startEdit = (category: string) => {
    setEditingCategory(category);
    setEditingValue(category);
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditingValue("");
    setEditError("");
  };

  const saveEdit = (oldName: string) => {
    const value = editingValue.trim().replace(/\s+/g, " ");
    if (value.length < 2) {
      setEditError("Nama kategori minimal 2 karakter.");
      return;
    }
    if (value === oldName) {
      cancelEdit();
      return;
    }
    const isDuplicate = categories.some(
      (category) =>
        category !== oldName &&
        category.toLocaleLowerCase("id-ID") === value.toLocaleLowerCase("id-ID")
    );
    if (isDuplicate) {
      setEditError("Nama kategori tersebut sudah digunakan.");
      return;
    }
    onEdit(oldName, value);
    cancelEdit();
  };

  const handleDelete = (category: string) => {
    const usedCount = expensesCountByCategory[category] || 0;
    const message =
      usedCount > 0
        ? `Kategori "${category}" dipakai pada ${usedCount} transaksi. Hapus dari daftar kategori?`
        : `Hapus kategori "${category}"?`;
    if (confirm(message)) {
      if (editingCategory === category) cancelEdit();
      onRemove(category);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="categories-title"
        className="glass-panel max-h-[90vh] w-full max-w-lg space-y-5 overflow-y-auto rounded-2xl p-5 sm:p-6"
      >
        <header className="flex items-center justify-between gap-3">
          <div>
            <h2 id="categories-title" className="text-lg font-bold text-white">Kategori Pengeluaran</h2>
            <p className="mt-1 text-sm text-slate-400">Tambah, edit, atau hapus kategori pengeluaran.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor="new-category" className="block text-sm font-semibold text-slate-200">
            Nama kategori baru
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="new-category"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              maxLength={48}
              className="glass-input min-w-0 flex-1 rounded-xl px-3 py-2.5 text-base"
              placeholder="Contoh: Bibit dan pupuk"
            />
            <button
              type="submit"
              className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 font-bold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Tambah
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-rose-400">
              {error}
            </p>
          )}
        </form>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-200">
            Kategori tersedia ({categories.length})
          </h3>
          <ul className="divide-y divide-white/10">
            {categories.map((category) => {
              const isEditing = editingCategory === category;
              const usedCount = expensesCountByCategory[category] || 0;

              return (
                <li key={category} className="py-2 text-sm text-slate-200">
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          ref={editInputRef}
                          type="text"
                          value={editingValue}
                          onChange={(event) => {
                            setEditingValue(event.target.value);
                            setEditError("");
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              saveEdit(category);
                            }
                          }}
                          maxLength={48}
                          aria-label={`Ubah nama kategori ${category}`}
                          className="glass-input min-w-0 flex-1 rounded-xl px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(category)}
                          aria-label={`Simpan perubahan kategori ${category}`}
                          title="Simpan"
                          className="rounded-lg bg-emerald-500/20 p-2 text-emerald-400 hover:bg-emerald-500/30 focus-visible:outline-2 focus-visible:outline-emerald-400 cursor-pointer"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          aria-label="Batal edit kategori"
                          title="Batal"
                          className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-slate-400 cursor-pointer"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {editError && (
                        <p role="alert" className="text-xs text-rose-400">
                          {editError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex min-h-10 items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="break-words">{category}</span>
                        {usedCount > 0 && (
                          <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400 border border-white/10">
                            {usedCount}
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          aria-label={`Edit kategori ${category}`}
                          title="Edit kategori"
                          className="rounded-lg p-2 text-amber-400 hover:bg-amber-500/15 focus-visible:outline-2 focus-visible:outline-amber-400 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category)}
                          aria-label={`Hapus kategori ${category}`}
                          title="Hapus kategori"
                          className="rounded-lg p-2 text-rose-400 hover:bg-rose-500/15 focus-visible:outline-2 focus-visible:outline-rose-400 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
};
