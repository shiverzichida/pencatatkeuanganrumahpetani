"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, HelpCircle, RotateCcw } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  scriptUrl,
  onSaveUrl,
}) => {
  const [urlInput, setUrlInput] = useState(scriptUrl);

  useEffect(() => {
    setUrlInput(scriptUrl);
  }, [scriptUrl, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveUrl(urlInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-white/10 overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Koneksi Google Spreadsheet</h3>
              <p className="text-[11px] text-slate-400">Sinkronisasi data 2 arah secara gratis & real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm font-semibold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Input URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Google Apps Script Web App URL:
          </label>
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full text-xs font-mono glass-input rounded-xl px-3.5 py-2.5 focus:outline-none placeholder:text-slate-600"
          />
          <p className="text-[11px] text-slate-400">
            Bila dikosongkan, data otomatis disimpan di browser Anda (LocalStorage).
          </p>
        </div>

        {/* Panduan 3 Langkah */}
        <div className="glass-panel-subtle rounded-2xl p-4 border border-white/5 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
            <HelpCircle className="w-4 h-4" />
            Cara Pasang di Google Spreadsheet (2 Menit):
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
            <li>
              Buka Google Sheets Anda &gt; menu <b className="text-slate-200">Ekstensi &gt; Apps Script</b>.
            </li>
            <li>
              Buka file <code className="text-emerald-300">google-apps-script.js</code> di folder proyek ini, <b className="text-slate-200">Copy</b> dan <b className="text-slate-200">Paste</b> ke Apps Script.
            </li>
            <li>
              Klik tombol <b className="text-slate-200">Terapkan (Deploy) &gt; Penerapan baru (New deployment)</b>.
            </li>
            <li>
              Pilih tipe <b className="text-slate-200">Aplikasi Web (Web App)</b>, pada akses pilih <b className="text-emerald-400">Siapa saja (Anyone)</b>.
            </li>
            <li>
              Klik <b className="text-slate-200">Deploy</b>, lalu salin link URL yang berakhiran <code className="text-emerald-300">/exec</code> ke kolom di atas.
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 text-slate-950 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer glow-emerald"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan URL
          </button>
        </div>
      </div>
    </div>
  );
};
