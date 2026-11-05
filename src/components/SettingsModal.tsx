"use client";

import React, { useState } from "react";
import { Settings, Save, CheckCircle2, Copy, ExternalLink, HelpCircle } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveUrl(urlInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-slate-200 overflow-y-auto max-h-[92vh]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Koneksi Google Spreadsheet</h3>
              <p className="text-xs text-slate-500">Sinkronisasi data 2 arah secara gratis & real-time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Input URL */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Google Apps Script Web App URL:
          </label>
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full text-xs font-mono border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-slate-50/50"
          />
          <p className="text-[11px] text-slate-400">
            Jika kosong, aplikasi akan otomatis menggunakan mode penyimpanan lokal di browser (LocalStorage).
          </p>
        </div>

        {/* Panduan 3 Langkah Singkat */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            Cara Buat Web App URL di Google Spreadsheet (2 Menit):
          </div>
          <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-relaxed">
            <li>
              Buka Google Sheets Anda &gt; menu <b>Ekstensi &gt; Apps Script</b>.
            </li>
            <li>
              Buka file <code>google-apps-script.js</code> di folder proyek ini, <b>Copy</b> kodenya dan <b>Paste</b> ke Apps Script.
            </li>
            <li>
              Klik tombol <b>Terapkan (Deploy) &gt; Penerapan baru (New deployment)</b>.
            </li>
            <li>
              Pilih tipe: <b>Aplikasi Web (Web App)</b>, pada <i>Who has access</i> pilih <b>Anyone (Siapa saja)</b>.
            </li>
            <li>
              Klik <b>Deploy</b>, lalu copy link Web App URL yang berakhiran <code>/exec</code> dan tempelkan di kotak atas!
            </li>
          </ol>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Simpan URL
          </button>
        </div>
      </div>
    </div>
  );
};
